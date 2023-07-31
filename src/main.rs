use lanyue::server;
use rust_embed::RustEmbed;


#[derive(RustEmbed)]
#[folder = "migration/"]
struct Migration;

#[tokio::main]
async fn main() {
    server::launch().await;
}
