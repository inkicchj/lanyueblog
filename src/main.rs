use lanyue::server;

#[tokio::main]
async fn main() {
    server::launch().await;
}
