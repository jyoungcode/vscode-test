/**
 * 작업순서
 * 1. const로 variable, class를 모두 작성
 * 2. class를 작성하고
 * 3. addEventListener에서 new를 생성하고
 * 4. addEventListener에서 '인스턴스.메서드'로 console을 찍어본다! 이렇게 하나한 data가 뭘 넘겨받는지 확인을 한다!
 * 5. 항상 Storage.getProduct()처럼 메서드 호출 먼저 만들고! 나서 해당 메서드 만든다.
 */

// contentful API
// npm install 안하고 CDN 써서 require('contentful') 안해도된다.
const client = contentful.createClient({
  // This is the "space ID". A space is like a project folder in Contentful terms
  space: 'nn2siqyp4dw8',
  // This is the "access token" for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: '7L-fzYqNSubKVDjDp9i6Tbx30rjY-SbJi8uPfGOtwZ8'
});

console.log('client', client);

// variables

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
// cart-items는 nav에 있는 것
const cartItems = document.querySelector('.cart-items');
// cart-total은 cart창 안에 총값
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

// cart
let cart = [];

// buttons
let buttonsDOM = [];

// getting the products
class Products {
  async getProducts() {
    try {
      // https://contentful.github.io/contentful.js/contentful/7.9.1/ContentfulClientAPI.html#.getEntries
      // https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters/content-type/query-entries/console/js
      let contentful = await client.getEntries({
        // content Model 탭에서 우측에서 복사
        content_type: 'comfyHouseProducts'
      });
      // .then(response => console.log(response.items))
      // .catch(console.error);
      console.log('contentful', contentful);

      // local json
      let result = await fetch('products.json');
      let data = await result.json();
      // let products = data.items;

      // return result;
      // return data;

      // contentful API json 불러오기
      let products = contentful.items;

      products = products.map(item => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;

        return { title, price, id, image };
      });

      return products;
    } catch (error) {
      console.log('error ', error);
    }
  }
}

// display products
class UI {
  displayProducts(products) {
    // console.log('products', products);
    console.log('UI product실행');
    // 여기서 html에 article.product 하나씩 자동으로 넣게끔 한다.
    let result = '';
    products.forEach(product => {
      result += `
        <!-- single product -->
        <article class="product">
          <div class="img-container">
            <img
              src=${product.image}
              alt="product"
              class="product-img"
            />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>
              add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>
        <!-- end: single product -->
      `;
    });
    productsDOM.innerHTML = result;
  }

  getBagButtons() {
    // ES6 : Spread operator , 해당 배열을 복사해서 쓰고, 확장 시킬 수도 있다.
    // 예시
    // let arr = [1, 2, 3, 4, 5];
    // let arr2 = [0, ...arr, 6, 7];
    // product에 hover시 add cart 버튼
    const buttons = [...document.querySelectorAll('.bag-btn')];

    buttonsDOM = buttons;

    buttons.forEach(button => {
      let id = button.dataset.id;
      // console.log(id);
      let inCart = cart.find(item => item.id === id);

      if (inCart) {
        button.innerText = 'In Cart';
        button.disabled = true;
      } else {
        button.addEventListener('click', event => {
          console.log('나 event ', event);
          event.target.innerText = 'In Cart';
          event.target.disabled = true;

          // 1. get product from products
          // 장바구니 물건 갯수를 위한 amount
          let cartItem = { ...Storage.getProduct(id), amount: 1 };
          // console.log('cartItem ', cartItem);

          // 2. add product to the cart
          cart = [...cart, cartItem];
          // console.log('cart', cart);

          // 3. save cart in local storage
          Storage.saveCart(cart);

          // 4. set cart values
          // this는 class UI
          this.setCartValues(cart);

          // 5. display cart item
          this.addCartItem(cartItem);

          // 6. show the cart
          this.showCart();
        });
      }
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
    // console.log(cartTotal, cartItems);
  }

  addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
      <img src=${item.image} alt="product" />
      <div>
        <h4>${item.title}</h4>
        <h5>$${item.price}</h5>
        <span class="remove-item" data-id=${item.id}>remove</span>
      </div>
      <div>
        <i class="fas fa-chevron-up" data-id=${item.id}></i>
        <p class="item-amount">${item.amount}</p>
        <i class="fas fa-chevron-down" data-id=${item.id}></i>
      </div>
    `;
    cartContent.appendChild(div);
  }

  showCart() {
    cartOverlay.classList.add('transparentBcg');
    cartDOM.classList.add('showCart');
  }
  hideCart() {
    cartOverlay.classList.remove('transparentBcg');
    cartDOM.classList.remove('showCart');
  }

  // 시작시 필요한 것들 불러오기
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
  }

  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }

  cartLogic() {
    // clear cart button
    clearCartBtn.addEventListener('click', () => {
      // 이렇게 해야 this가 UI
      this.clearCart();
    });
    // cart functionality
    cartContent.addEventListener('click', event => {
      // console.log('event', event.target);
      if (event.target.classList.contains('remove-item')) {
        let removeItem = event.target;
        // console.log('removeItem', removeItem);
        let id = removeItem.dataset.id;

        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains('fa-chevron-up')) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        // amount 수량 올리기
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount + 1;

        Storage.saveCart(cart);
        this.setCartValues(cart);

        // html에서 보면 fa-chevron-up 다음 요소
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains('fa-chevron-down')) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount - 1;

        if (tempItem.amount > 0) {
          // cart안에 item이 0보다 클 경우만
          Storage.saveCart(cart);
          this.setCartValues(cart);
          // click했을때 이전형제니까 수치
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          // 0보다 작으면 cart안 item을 삭제
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }

  clearCart() {
    // console.log('this', this);
    let cartItems = cart.map(item => item.id);
    // console.log('cartItems', cartItems);
    cartItems.forEach(id => this.removeItem(id));
    console.log('cartContent children', cartContent.children);
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>
    add to cart`;
  }

  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }
}

// local storage
class Storage {
  // static은 인스턴스 생성없이 불러올때 사용
  // 화면에 보이는 products
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }

  // Products.getProducts와 헷갈리지 말자!
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));

    return products.find(product => product.id === id);
  }

  // add cart 버튼 누르면 cart에 저장
  static saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  // 페이지 시작시 cart 가져오기
  static getCart() {
    return localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI();
  const products = new Products();

  // setup APP
  ui.setupAPP();

  // get all products
  // products.getProducts().then(products => console.log('products', products));
  products
    .getProducts()
    .then(products => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    // 이거 1번으로 작성하고 위에 UI에서 메서드 작성
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
