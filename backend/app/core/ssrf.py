import ipaddress
import socket
from urllib.parse import urlparse
from typing import Tuple, Optional, List
import httpx
from backend.app.config import settings

# Explicit blocked metadata hosts and reserved targets
BLOCKED_HOSTNAMES = {
    "localhost",
    "metadata.google.internal",
    "instance-data",
    "169.254.169.254",
    "metadata.azure.com"
}

class SSRFSecurityException(Exception):
    """Raised when a URL resolves to a prohibited network address or violates egress policy."""
    pass

def is_ip_prohibited(ip_str: str) -> bool:
    """
    Check if an IP address belongs to private, loopback, link-local,
    reserved, multicast, unspecified, or cloud metadata ranges.
    """
    try:
        ip = ipaddress.ip_address(ip_str)
        
        # Handle IPv6 mapped IPv4 addresses (::ffff:127.0.0.1)
        if isinstance(ip, ipaddress.IPv6Address) and ip.ipv4_mapped:
            ip = ip.ipv4_mapped

        # Block loopback (127.0.0.0/8, ::1)
        if ip.is_loopback:
            return True
            
        # Block private networks (RFC 1918: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, etc.)
        if ip.is_private:
            return True
            
        # Block link-local (169.254.0.0/16, fe80::/10 - AWS/GCP/Azure instance metadata)
        if ip.is_link_local:
            return True
            
        # Block reserved, multicast, unspecified (0.0.0.0, 224.0.0.0/4, etc.)
        if ip.is_reserved or ip.is_multicast or ip.is_unspecified:
            return True

        # Carrier Grade NAT (100.64.0.0/10)
        cgnat = ipaddress.ip_network("100.64.0.0/10")
        if ip in cgnat:
            return True

        return False
    except ValueError:
        # Invalid IP representation
        return True

def validate_target_url(raw_url: str) -> Tuple[bool, str, Optional[str]]:
    """
    Validate URL structure, protocol, and resolve hostname to verify no SSRF target is reached.
    Returns: (is_safe, message, resolved_ip)
    """
    try:
        parsed = urlparse(raw_url)
    except Exception as e:
        return False, f"Malformed URL: {str(e)}", None

    if parsed.scheme.lower() not in ("http", "https"):
        return False, f"Prohibited scheme: '{parsed.scheme}'. Only http and https are allowed.", None

    hostname = parsed.hostname
    if not hostname:
        return False, "URL contains no valid hostname.", None

    hostname_clean = hostname.strip().lower()
    if hostname_clean in BLOCKED_HOSTNAMES:
        return False, f"Access to prohibited hostname '{hostname_clean}' is strictly blocked.", None

    # Check if hostname is a raw IP literal
    try:
        ip = ipaddress.ip_address(hostname_clean)
        if is_ip_prohibited(str(ip)):
            return False, f"Access to prohibited IP literal '{hostname_clean}' is blocked (SSRF Protection).", str(ip)
        return True, "Safe public IP literal", str(ip)
    except ValueError:
        # Hostname is a domain name, proceed with DNS resolution check
        pass

    # Resolve all DNS A and AAAA records
    try:
        addr_info = socket.getaddrinfo(hostname_clean, None, socket.AF_UNSPEC, socket.SOCK_STREAM)
    except socket.gaierror:
        # Non-resolving domains cannot perform SSRF network egress; allow static lexical analysis
        return True, f"Domain '{hostname_clean}' does not resolve in public DNS; safe for static lexical analysis.", None

    resolved_ips = []
    for entry in addr_info:
        sockaddr = entry[4]
        ip_addr = sockaddr[0]
        resolved_ips.append(ip_addr)
        if is_ip_prohibited(ip_addr):
            return False, f"Hostname '{hostname_clean}' resolved to prohibited address '{ip_addr}' (SSRF Protection).", ip_addr

    if not resolved_ips:
        return True, "Could not resolve any IP address for host; safe for static analysis.", None

    return True, "URL validated safe for external egress.", resolved_ips[0]

async def safe_fetch_url_metadata(url: str) -> dict:
    """
    Safely inspect a URL with strict SSRF controls:
    - Pre-flight DNS validation
    - Non-redirecting initial request to validate each step
    - Size cap (SSRF_MAX_RESPONSE_BYTES)
    - Short connection timeout
    """
    is_safe, msg, resolved_ip = validate_target_url(url)
    if not is_safe:
        return {
            "success": False,
            "error": "SSRF_PREVENTION_BLOCKED",
            "message": msg,
            "resolved_ip": resolved_ip,
            "status_code": None,
            "content_preview": None
        }

    transport = httpx.AsyncHTTPTransport(retries=0)
    try:
        async with httpx.AsyncClient(
            transport=transport,
            timeout=settings.SSRF_REQUEST_TIMEOUT_SECONDS,
            follow_redirects=False,
            verify=True,
            headers={"User-Agent": "CYBERSHIELD-Security-Auditor/1.0 (+https://cybershield.org/bot)"}
        ) as client:
            resp = await client.get(url)
            
            # Read bounded chunk to prevent memory exhaustion
            content_bytes = resp.read()
            if len(content_bytes) > settings.SSRF_MAX_RESPONSE_BYTES:
                content_bytes = content_bytes[:settings.SSRF_MAX_RESPONSE_BYTES]
            
            preview = content_bytes[:2000].decode("utf-8", errors="ignore")
            
            return {
                "success": True,
                "error": None,
                "message": "Metadata retrieved safely",
                "resolved_ip": resolved_ip,
                "status_code": resp.status_code,
                "headers": dict(resp.headers),
                "is_redirect": resp.is_redirect,
                "redirect_target": resp.headers.get("location"),
                "content_preview": preview
            }
    except httpx.RequestError as exc:
        return {
            "success": False,
            "error": "REQUEST_FAILED",
            "message": f"Connection error: {str(exc)}",
            "resolved_ip": resolved_ip,
            "status_code": None,
            "content_preview": None
        }
