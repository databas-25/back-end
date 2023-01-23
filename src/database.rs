use mysql::*;
use mysql::prelude::*;

pub fn init() -> Result<Pool> {
    let url = "mysql://root:bob123!@localhost:3306/shopping_db";
    Pool::new(url)
}

pub fn connection(pool: Pool) -> PooledConn{

    pool.get_conn().unwrap()
    
}