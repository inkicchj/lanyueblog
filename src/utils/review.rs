use reqwest;
use serde::{Deserialize, Serialize};
use serde_json;
use crate::CONF;
use anyhow;
use tokio_test;


const TEXT_CENSOR: &str = "https://aip.baidubce.com/rest/2.0/solution/v1/text_censor/v2/user_defined";
const TOKEN_URL: &str = "https://aip.baidubce.com/oauth/2.0/token";


#[derive(Deserialize, Debug)]
struct TokenResponse {
    access_token: String,
    scope: String,
}

#[derive(Deserialize, Debug)]
struct ReviewResult {
    conclusion: String,
}


async fn get_access_token() -> anyhow::Result<TokenResponse> {
    let url = reqwest::Url::parse_with_params(TOKEN_URL,
        &[
            ("grant_type", "client_credentials"),
            ("client_id", &CONF.service.access_api_key),
            ("client_secret", &CONF.service.access_secret_key)
        ]
    )?;
    let client = reqwest::Client::new();
    let res = client.post(url.as_str()).send().await?;
    let text = res.text().await?;
    let tr = serde_json::from_str::<TokenResponse>(&text)?;
    Ok(tr)
}

pub async fn text(s: String) -> anyhow::Result<bool> {
    let tr = get_access_token().await?;
    let mut url = String::new();
    url.push_str(TEXT_CENSOR);
    url.push_str("?access_token=");
    url.push_str(&tr.access_token);
    let data = format!("text={}", s);
    let client = reqwest::Client::new();
    let res = client.post(url.as_str())
        .body(data)
        .header("Content-Type", "application/x-www-form-urlencoded")
        .send().await?;
    let text = res.text().await?;
    let result = serde_json::from_str::<ReviewResult>(&text)?;
    if result.conclusion == "合规".to_string() {
        Ok(true)
    } else {
        Ok(false)
    }

}

// #[cfg(test)]
// mod tests {
//     use super::*;
//     #[test]
//     fn test_add() {
//         let r =  tokio_test::block_on(text("你好".to_string()));
//         println!("{}", r.unwrap());
//     }
// }