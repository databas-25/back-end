use mysql::*;
use mysql::prelude::*;
mod database;

#[derive(Debug, PartialEq, Eq)]
struct Payment {
    amount: i32,
    account_name: Option<String>,
}


fn main() -> std::result::Result<(), Box<dyn std::error::Error>> {
    // let url = "mysql://root:bob123!@localhost:3306/shopping_db";
    // let pool = Pool::new(url)?;

    // let mut conn = pool.get_conn()?;

    let pool = database::init()?;
    let mut conn = database::connection(pool);
        //do stoff

    let res = conn.query_drop(
        r"CREATE TABLE payment (
            customer_id INT NOT NULL AUTO_INCREMENT,
            amount INT NOT NULL,
            account_name TEXT,
            PRIMARY KEY(customer_id))
        ");

    res.unwrap_or(());

    let payments = vec![
        Payment {amount: 2, account_name: None },
        Payment {amount: 4, account_name: Some("foo".into()) },
        Payment {amount: 6, account_name: None },
        Payment {amount: 8, account_name: None },
        Payment {amount: 10, account_name: Some("bar".into()) },
    ];

    // Now let's insert payments to the database
    conn.exec_batch(
        r"REPLACE INTO payment (amount, account_name)
            VALUES (:amount, :account_name)",
        payments.iter().map(|p| params! {
            "amount" => p.amount,
            "account_name" => &p.account_name,
        })
    )?;

    // Let's select payments from database. Type inference should do the trick here.
    let selected_payments = conn
        .query_map(
            "SELECT amount, account_name from payment",
            |(amount, account_name)| {
                Payment {amount, account_name }
            },
        )?;

    // Let's make sure, that `payments` equals to `selected_payments`.
    // Mysql gives no guaranties on order of returned rows
    // without `ORDER BY`, so assume we are lucky.
    assert_eq!(payments, selected_payments);
    
    
    //println!("Yay!"); //panics on 2nd run due to the insert adding the same stuff every run
    
    Ok(())
}