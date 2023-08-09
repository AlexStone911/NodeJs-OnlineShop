const fs = require('fs');
const path = require('path');
const Cart = require('./cart');
const p = path.join(path.dirname(process.mainModule.filename), 'data', 'products.json');

const getProductsFromFile = (callback) => {
   fs.readFile(p, (err, fileContent) => {
      if (err) {
         return callback([]);
      }
      callback(JSON.parse(fileContent));
   });
};

module.exports = class Product {
   constructor(id, title, imageUrl, description, price) {
      this.id = id;
      this.title = title;
      this.imageUrl = imageUrl;
      this.description = description;
      this.price = price;
   }

   save() {
      getProductsFromFile(products => {
         if (this.id) {
            const existingProductIndex = products.findIndex(prod => prod.id === this.id);
            const updatedProducts = [...products];
            updatedProducts[existingProductIndex] = this;

            fs.writeFile(p, JSON.stringify(updatedProducts), err => {
               console.log(err);
            });
         } else {
            this.id = Math.random().toString();

            products.push(this);
            fs.writeFile(p, JSON.stringify(products), err => {
               console.log(err);
            });
         }
      });
   }

   static deleteById(id) {
      getProductsFromFile((products) => {
         const product = products.find(prod => prod.id === id);
         const updatedProducts = products.filter((product) => {
            return product.id !== id;
         });
         
         fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
            if (!err) {
               Cart.deleteProduct(id);
            }
            console.log(err);
         });
      });
   }

   static fetchAll(callback) {
      getProductsFromFile(callback);
   }

   static findById(id, callback) {
      getProductsFromFile((products) => {
         const product = products.find((product) => {
            return product.id === id;
         });
         callback(product);
      });
   }
};