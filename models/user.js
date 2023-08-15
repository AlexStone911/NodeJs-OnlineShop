const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');
class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }

  save() {
    const db = getDb();
  
    return db.collection('users').insertOne(this);
  }

  addToCart(product) {
    const cartProductIndex = this.cart ? this.cart.items.findIndex(prod => {
      return prod.productId.toString() === product._id.toString();
    }) : -1;

    let newQuantity = 1;
    let updatedCartItems = this.cart ? [...this.cart.items] : [];

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: new mongodb.ObjectId(product._id), 
        quantity: newQuantity
      });
    }

    const updatedCart = { items: updatedCartItems };

    const db = getDb();
    return db.collection('users').updateOne(
      {_id: new mongodb.ObjectId(this._id)},
      {$set: {cart: updatedCart}}
    );
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map(item => {
      return item.productId;
    })
    return db
    .collection('products')
    .find({_id: {$in: productIds}})
    .toArray()
    .then(products => {
      return products.map(product => {
        return {...product, quantity: this.cart.items.find(item => {
          return item.productId.toString() === product._id.toString();
        }).quantity}
      })
    });
  }

  addOrder() {
    const db = getDb();
    return this.getCart()
      .then(products => {
        const order = {
          items: products,
          user: {
            _id: new mongodb.ObjectId(this._id),
            name: this.name
          }
        };
        return db.collection('orders').insertOne(order);
      })
      .then(result => {
        this.cart = { items: [] };
        return db
          .collection('users')
          .updateOne(
            { _id: new mongodb.ObjectId(this._id) },
            { $set: { cart: { items: [] } } }
          );
      });
  }


  getOrders() {
    const db = getDb();
    return db.collection('orders').find({'user._id': new mongodb.ObjectId(this._id)}).toArray();
  }

  deleteItemFromCart(productId) {
    console.log(productId);
    const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== productId;
    });

    const db = getDb();

    return db
      .collection('users')
      .updateOne(
        {_id: new mongodb.ObjectId(this._id)},
        {$set: {cart: {items: updatedCartItems}}}
      );
  }

  static findById(userId) {
    const db = getDb();
  
    return db
      .collection('users')
      .find({_id: new mongodb.ObjectId(userId)})
      .next();
  }
}

module.exports = User;