use crypto::pbkdf2;
use std::io::Result;

pub struct Encrypt;


impl Encrypt {
    pub fn generate(password: &str) -> Result<String> {
        pbkdf2::pbkdf2_simple(password, 10)
    }

    pub fn check(password: &str, s: &str) -> bool {
        match pbkdf2::pbkdf2_check(password, s) {
            Ok(b) => b,
            Err(_) => false
        }
    }
}