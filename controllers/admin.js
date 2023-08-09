const Product = require('../models/product');

exports.getAddProduct =  (req, res, next) => {
   res.render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false
   });
};

exports.getEditProduct =  (req, res, next) => {
   const editMode = req.query.edit;
   if (editMode !== 'true') {
      res.redirect('/');
   }

   const prodId = req.params.productId;
   Product.findById(prodId, (product) => {
      if (!product) {
         res.redirect('/');
      }

      res.render('admin/edit-product', {
         pageTitle: 'Edit Product',
         path: '/admin/edit-product',
         editing: editMode,
         product: product
      });
   });
};

exports.postEditProduct = (req, res, next) => {
   const prodId = req.body.productId;
   const updatedTitle = req.body.title;
   const updatedPrice = req.body.price;
   const updatedImageUrl = req.body.imageUrl;
   const updatedDescription = req.body.description;

   const updatedProduct = new Product(prodId, updatedTitle, updatedImageUrl, updatedDescription, updatedPrice);
   updatedProduct.save();

   res.redirect('/admin/products');
};

exports.postAddProduct = (req, res, next) => {
   const title = req.body.title;
   const price = req.body.price;
   const description = req.body.description;
   const imageUrl = req.body.imageUrl;
   const product = new Product(null, title, imageUrl, description, price);
   product.save();
   res.redirect('/');
};

exports.getProducts =  (req, res, next) => {
   Product.fetchAll(products => {
      res.render('admin/products', {
         prods: products, 
         pageTitle: 'Admin Products', 
         path: '/admin/products'
      });
   });
};

exports.postDeleteProduct = (req, res, next) => {
   const productId = req.body.productId;
   Product.deleteById(productId);
   res.redirect('/admin/products');

};