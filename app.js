//variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

//cart array
let cart = [];
//BUTTON ARRAY
let buttonsDOM = [];

//make different classes to handle different functionalities....

//getting products from local storage
class Products {
  //fetch all products
  async getProducts() {
    try {
      let result = await fetch("http://localhost:3000/items");

      let products = await result.json();
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;

        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

//display products
class UI {
  displayProducts(products) {
    let result = "";
    products.map((product) => {
      result += `
      <!-- single product -->
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="product" class="product-img" />
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i> add to cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
            <!-- end of single product -->
      `;
    });
    productsDOM.innerHTML = result;
  }
  getAllButtons() {
    //get all buttons and use spread operation to run loop.
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.map((button) => {
      //get every button id
      let id = button.dataset.id;
      //find items in cart array declare at the top by matching the id of buttons
      let inCart = cart.find((item) => item.id === id);
      //if item is already in cart the change something
      if (inCart) {
        button.innerText = "Already In Cart";
        button.disabled = true;
      }
      //else  add button event
      button.addEventListener("click", () => {
        button.innerText = "Already In Cart";
        button.disabled = true;
        //now get products from local storage according to id of button that clicked...
        let cartItem = { ...Storage.getProducts(id), amount: 1 };

        //now add products to cart array
        cart = [...cart, cartItem];

        //now save the cart items (cart array) in local storage
        Storage.saveCart(cart);
        //now set cart values
        this.setCartValues(cart);
        //now move items to the cart
        this.addCartItems(cartItem);
        //now show the cart
        this.showCart();
      });
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal = tempTotal + item.price * item.amount;
      itemsTotal = itemsTotal + item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }

  addCartItems(product) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
                    <img src=${product.image} alt="product" class="product">

                    <div>
                        <h4>${product.title}</h4>
                        <h5>$${product.price}</h5>
                        <span class="remove-item" data-id=${product.id}>remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${product.id}></i>
                        <p class="item-amount">${product.amount}</p>
                        <i class="fas fa-chevron-down" data-id=${product.id}></i>

                    </div>
                `;
    cartContent.appendChild(div);
  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  //setup the cart functionality call this method before getProducts method because we want to access it
  // from local storage as well
  setUpCart() {
    //set cart array
    cart = Storage.getCart();
    console.log("data is", cart);
    //here reuse the setCartValues method
    this.setCartValues(cart);
    //one more method to papulate the cart
    this.papulateCart(cart);
    // now handle some buttons
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", () => {
      // here the opposite the showCart function to hide the cart
      cartOverlay.classList.remove("transparentBcg");
      cartDOM.classList.remove("showCart");
    });
  }
  papulateCart(cart) {
    cart.map((item) => this.addCartItems(item));
  }
  cartLogic() {
    //clear cart btn
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    //cart functionality
    cartContent.addEventListener("click", (event) => {
      console.log(event.target);
      if (event.target.classList.contains("remove-item")) {
        let removeProduct = event.target;
        let id = removeProduct.dataset.id;
        cartContent.removeChild(cartContent.children[0]);
        this.removeItem(id);
      }
      //to increse button
      else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      }
      //to decrease button
      else if (event.target.classList.contains("fa-chevron-down")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        if (tempItem.amount > 0) {
          tempItem.amount = tempItem.amount - 1;
          Storage.saveCart(cart);
          this.setCartValues(cart);
          addAmount.previousElementSibling.innerText = tempItem.amount;
        }
      }
    });
  }
  clearCart() {
    let cartItem = cart.map((item) => item.id);
    cartItem.map((id) => this.removeItem(id));

    //NOW TO CLERA ALL DATA FROM CART
    //check if there is any child of cartContent then just remove it using[0]
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    // here the opposite the showCart function to hide the cart
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    // now get the button to change there text back
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `  <i class="fas fa-shopping-cart"></i> add to cart`;
  }
  getSingleButton(id) {
    return buttonsDOM.find((btn) => btn.dataset.id === id);
  }
}

//local storage
class Storage {
  //we need saveProducts method in UI class so we need to make is static method
  // so we can access it in other classes without make class obj.
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  //get products
  static getProducts(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  //save cart items
  static saveCart(items) {
    localStorage.setItem("cart", JSON.stringify(items));
  }
  //get cart items from local storage
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

//when page loaded this event will fire
document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  ui.setUpCart();
  products
    .getProducts()
    .then((data) => {
      ui.displayProducts(data);
      // without make class obj we can access static method by using class name so
      Storage.saveProducts(data);
    })
    .then(() => {
      ui.getAllButtons();
      ui.cartLogic();
    });
});
