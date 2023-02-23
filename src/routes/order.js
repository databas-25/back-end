const express = require('express');
const pool = require('../setup');
const router = express.Router();



router.post('/place', (req, res) => {
    pool.beginTransaction((err) => {
        if (err) {console.error(err)}

        // get the user basket
        const basket = [];
        pool.query('SELECT * FROM Basket_Items WHERE Users_User_id = ?', [req.userID]) 
        .on('result', (r) => {
            basket.push(r);
        });

        // insert order
        pool.query('INSERT INTO Order (Users_User_id) VALUES (?)', [req.userID], function (error, result, fields) {
            if (error) {
                return pool.rollback( function () {
                  throw error;
                });
              }

            const orderID = result.insertId; // gets Order_id

            const values = []; // so that the whole basket can be inserted in one query
            for (let i = 0; i < basket.length; i++) {
                const temp = [];
                temp.push(orderID);
                temp.push(basket[i].Products_Product_id);
                temp.push(basket[i].amount);
                values.push(temp);
              }
    
            const sql = "INSERT INTO Order_Item (Order_Order_id, Products_Product_id, amount) VALUES ?"
            pool.query(sql, [values], function () {
                if (error) {
                    return pool.rollback(function() {
                      throw error;
                    });
                  }

                pool.query('DELETE FROM Basket_Items WHERE Users_User_id = ?', [req.body.userID], function () {
                    if (error) {
                        return pool.rollback(function() {
                          throw error;
                        });
                      }
                    
                    pool.commit(function(err) {
                        if (err) {
                            return connection.rollback(function() {
                              throw err;
                            });
                          }
                          console.log('success!');
                    });

                });                  
            });
        });
        

        
     //////   clear the user cart ---------
        //pool.query('DELETE FROM Basket_Items WHERE Users_User_id = ?', [req.body.userID]);
////////////////////


    })
})
 


module.exports = router;