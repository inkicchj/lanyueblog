use crypto::pbkdf2;
use std::io::Result;

pub struct Encrypt;


impl Encrypt {
    pub fn generate(password: &str) -> Result<String>{
        pbkdf2::pbkdf2_simple(password, 10)
    }

    pub fn check(password: &str, s:&str) ->  bool {
        match pbkdf2::pbkdf2_check(password, s) {
            Ok(b) => b,
            Err(_) => false
        }
        
    }
}

// #[cfg(test)]
// mod tests {
//     use super::*;
//     #[test]
//     fn check_password() {
//         // let hash = Encrypt::generate("12345678").unwrap();
//         let hash = String::from("$rpbkdf2$0$AAAACg==$6mTFHCy2rn+mlE44pCaRQw==$0fQZ8GeV0kqQFbX2dHV4dM09mynTHPZQzspMPgwKVSM=$");
//         let p = "huangjie0114";
//         let r = Encrypt::check(p, &hash[..]);
//         println!("result: {}", r);
//         assert_eq!(true, r);
//     }
// }