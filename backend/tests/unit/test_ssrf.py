import pytest
from backend.app.core.ssrf import is_ip_prohibited, validate_target_url

def test_prohibited_ips():
    # Loopback
    assert is_ip_prohibited("127.0.0.1") is True
    assert is_ip_prohibited("127.0.1.5") is True
    assert is_ip_prohibited("::1") is True
    
    # RFC 1918 Private
    assert is_ip_prohibited("10.0.0.1") is True
    assert is_ip_prohibited("172.16.0.1") is True
    assert is_ip_prohibited("192.168.1.1") is True
    
    # Cloud metadata
    assert is_ip_prohibited("169.254.169.254") is True
    
    # Public IP
    assert is_ip_prohibited("8.8.8.8") is False
    assert is_ip_prohibited("1.1.1.1") is False

def test_validate_target_url_blocks_internal_and_schemes():
    # Invalid schemes
    safe, msg, _ = validate_target_url("file:///etc/passwd")
    assert safe is False
    assert "scheme" in msg.lower()
    
    safe, msg, _ = validate_target_url("gopher://127.0.0.1:25")
    assert safe is False
    
    # Localhost and metadata hostnames
    safe, msg, _ = validate_target_url("http://localhost:8080/admin")
    assert safe is False
    
    safe, msg, _ = validate_target_url("http://169.254.169.254/latest/meta-data/")
    assert safe is False
    
    safe, msg, _ = validate_target_url("http://127.0.0.1:8000/api/v1")
    assert safe is False
