class Catalog{
    products;
    FAKESTORE_API = "https://fakestoreapi.com/products";
    CURRENCY_API = "https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/cad.json";
    FAKESTORE_API_BKP = "https://deepblue.camosun.bc.ca/~c0180354/ics128/final/fakestoreapi.json";
    constructor(){
        this.products = [];
        this.product_data = [];
        this.currencyData = {};
        this.currencySymbol = {cad:"CAD", usd:"$", brl:"R$"};
        this.selectedCurrency = "CAD";
        this.currencyMultiplier = 1;
        this.notAttached = true;
        this.cartNotAttached = true;
        //this.load_currency_API(); Currency api offline
        this.totalAfterTaxes = 0;
        this.intialize_products();
        this.response;
        this.orderData = { 
            card_number: 'valid credit card number, no spaces',
            expiry_month: 'two digit month number -- example: 01',
            expiry_year: 'four digit year -- example: 2022',
            security_code: 'three or four digit number',
            amount: 'amount to bill -- example: 23.45',
            taxes: '15.00',
            shipping_amount: '12.00',
            currency: 'three character currency code, MUST be lowercase -- example: cad',
            items: get_cookie("shopping_cart_items"),
            billing: {
                first_name: 'John',
                last_name: 'Doe',
                address_1: '123 Some St',
                address_2: 'Second Street Info [Optional] ',
                city: 'Some City',
                province: 'Two Character Province or State Code',
                country: 'Two Character Country Code',
                postal: 'Valid Postal or ZIP Code',
                phone: 'Valid International or North American Phone Number',
                email: 'Valid Email Address'
            },
            shipping: {
                first_name: 'John',
                last_name: 'Doe',
                address_1: '123 Some St',
                address_2: 'Second Street Info [Optional] ',
                city: 'Some City',
                province: 'Two Character Province or State Code',
                country: 'Two Character Country Code',
                postal: 'Valid Postal or ZIP Code'  
            }
        }
    }
    //fetches the products from the external API
    async intialize_products(){
        try{
            await fetch(this.FAKESTORE_API).
                then(response => response.json()).
                    then( data => {
                        this.products = data;
                        this.render_page();
                    });
            for(let product of this.products){
                let id = product.id;
                this.product_data[id] = product;
            }
        }catch(e){
        //Tries to fetch products from backup api if main api is offline
            try{
                await fetch(this.FAKESTORE_API_BKP).
                    then(response => response.json()).
                        then( data => {
                            this.products = data;
                            this.render_page();
                        });
                for(let product of this.products){
                    let id = product.id;
                    this.product_data[id] = product;
                }
            }catch(e){
            //launches error modal if all fails
                $("#API-error").click();
            }
        }

        
    }
    //fetches data from currency api
    async load_currency_API(){  
    
        try{
            await fetch(this.CURRENCY_API).
            then(response => response.json()).
                then( data => {
                    this.currencyData = data;
                    });                
        }catch(e){
            $("#currency-dropdown").hide();
        }
        fetch(this.CURRENCY_API).
            then(response => response.json()).
                then( data => {
                    this.currencyData = data;
                    });
                
            
    }
    //returns product by id
    getProductById(id){
        for(let product of this.products){
            if(product.id == id){
                return product;
            }
        }
    }

    //calculates the amount of taxes based on the selected province, if billing is US there are no taxes
    calculateTaxes(){
        let c = $("#billing-province").val();
        switch(c.toUpperCase()){
            case "NL":
                this.orderData.taxes = (this.orderData.amount * 0.15).toFixed(2);
                break;
            case "PE":
                this.orderData.taxes = (this.orderData.amount * 0.15).toFixed(2);
                break;
            case "NS":
                this.orderData.taxes = (this.orderData.amount * 0.05).toFixed(2);
                break;
            case "NB":
                this.orderData.taxes = (this.orderData.amount * 0.15).toFixed(2);
                break;
            case "QC":
                this.orderData.taxes = (this.orderData.amount * 0.15).toFixed(2);
                break;
            case "ON":
                this.orderData.taxes = (this.orderData.amount * 0.13).toFixed(2);
                break;
            case "MB":
                this.orderData.taxes = (this.orderData.amount * 0.12).toFixed(2);
                break;
            case "SK":
                this.orderData.taxes = (this.orderData.amount * 0.11).toFixed(2);
                break;
            case "AB":
                this.orderData.taxes = (this.orderData.amount * 0.05).toFixed(2);
                break;
            case "BC":
                this.orderData.taxes = (this.orderData.amount * 0.12).toFixed(2);
                break;
            case "YT":
                this.orderData.taxes = (this.orderData.amount * 0.05).toFixed(2);
                break;
            case "NT":
                this.orderData.taxes = (this.orderData.amount * 0.05).toFixed(2);
                break;
            case "NU":
                this.orderData.taxes = (this.orderData.amount * 0.05).toFixed(2);
                break;
            
        }
        if($("#billing-country").val() == 'US'){
            this.orderData.taxes = 0;
        }
    }

    //renders the cart with the items in the cart
    async render_cart(){

        let total = 0;
        let cart = await get_cookie("shopping_cart_items");

        
        //fills the cart and confirmation tables with the contents in the cart (cookie)
        if(cart !== null && Object.keys(cart).length != 0){       
            jQuery("#shopping_cart_table").html('');
            jQuery("#shopping_cart_table").append(`<thead class="table-dark"><tr><th scope="col"></th>
            <th scope="col">Qty</th>
            <th scope="col">Product</th>
            <th scope="col">price</th>
            </tr></thead>`);
            $("#confirmation-table").html('');
            $("#confirmation-table").append(`<thead class="table-dark"><tr>
            <th scope="col">Qty</th>
            <th scope="col">Product</th>
            <th scope="col">price</th>
            </tr></thead>`);
            for(let cartProduct in cart){
                let item = this.getProductById(cartProduct);
                jQuery("#shopping_cart_table").append(`<tbody class="table-light><tr prodId="${cartProduct}">
                    <th scope="col"><span data-bs-toggle="tooltip" data-bs-placement="bottom" title="Delete" itemId="${cartProduct}" class="material-symbols-outlined remove_item">
                    delete
                    </span></th>
                    <th scope="col text-right">${cart[cartProduct]}</th>
                    <th scope="col">${item.title}</th>
                    <th scope="col" class="price">${this.selectedCurrency}${(item.price * this.currencyMultiplier).toFixed(2)}</th>
                </tr></tbody>`
                );
                total += item.price * cart[cartProduct];
                $("#confirmation-table").append(`<tbody class="table-light">
                    <tr prodId="${cartProduct}">
                    <th scope="col">${cart[cartProduct]}</th>
                    <th scope="col">${item.title}</th>
                    <th class="price">${this.selectedCurrency}${(item.price * this.currencyMultiplier).toFixed(2)}</th>
                </tr></tbody>`
                );
                
            }
            jQuery("#shopping_cart_table").append(`
            <tr>
            
            <th scope="col">Total:</th>
            <th scope="col"></th>
            <th scope="col"></th>
            <th class="price" scope="col">${this.selectedCurrency}${(total * this.currencyMultiplier).toFixed(2)}</th>
            </tr>`);
            $("#confirmation-table").append(`<tbody class="table-primary">
            <tr>
            <th scope="col">Taxes:</th>
            <th scope="col"></th> 
            <th class="price" scope="col">${this.selectedCurrency}${(this.orderData['taxes'] * this.currencyMultiplier).toFixed(2)}</th>
            </tr>
            <tr>
            <th scope="col">Shipping:</th>  
            <th scope="col"></th>          
            <th class="price" scope="col">${this.selectedCurrency}${(this.orderData['shipping_amount'] * this.currencyMultiplier).toFixed(2)}</th>
            </tr></tbody>
            <tr>
            <th scope="col">Total:</th>
            <th scope="col"></th>
            <th class="price" scope="col">${this.selectedCurrency}${(parseFloat(parseFloat(total) + parseFloat(this.orderData['taxes']) + parseFloat(this.orderData['shipping_amount']))* parseFloat(this.currencyMultiplier)).toFixed(2)}</th>
            </tr>`);
            $("#confirmation-footer").html(`<div class="d-flex justify-content-between footer-btns"><button id="confirmation-prev-btn" class="btn btn-primary">Previous</button><button onclick="catalog.validateFormData()" id="complete-order" type="button" class="btn btn-success">Complete Order</button></div>`);
           
            jQuery("#cart_footer").html(`<div class="d-flex justify-content-between"><button id="goToCheckout" type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#checkoutModal">
            Checkout
          </button>
          <button type="button" class="btn bg-warning" id="empty_cart_btn" >
            Empty Cart
          </button></div>`);
          this.attach_cart_events();

          $("#confirmation-prev-btn").click( (event) => {
            event.preventDefault();
            document.getElementById("shipping-tab-btn").click();
        });
        
        //if cart is empty (cookie is an empty object), the buttons are not added to the offcanvas
        }else{
            jQuery("#shopping_cart_table").html("<b>Cart is Empty</b>");
            jQuery("#cart_footer").html('');
        }
        //adds total to the orderData        
        this.orderData.amount = total;

    }
    //renders the page by populating it with the contents fetched from the api
    async render_page(){
        let cart = await get_cookie("shopping_cart_items");
        jQuery("#catalog").html('');
        for(let product of this.products){
            let {category, description, id, image, price, rating, title} = product;
            jQuery("#catalog").append(`<div class="col-sm-6 col-lg-4 mb-4 product">
            <div class="card">
              <img src="${image}" class="card-img-top card-v" alt="test">
              <div class="card-body">
                <h5 class="card-title">${title}</h5>
                <p class="card-text">${description}</p>
                <p class="price-tag price"><h5>${this.selectedCurrency}${(price * this.currencyMultiplier).toFixed(2)}</h5></p>
                <a id="add-cart-btn-${id}" data-id="${id}" class="btn btn-primary add-to-cart-button" data-bs-toggle="offcanvas" data-bs-target="#cart" aria-controls="offcanvasExample">add to cart</a>
              </div>
            </div>
            </div>`);
            //checks if item is found in the cart and updates the number in the button. If there are no items of this id, the span tag is removed
            if(cart !== null && cart[id] > 0){
                jQuery("#add-cart-btn-" + id).html(`add to cart   <span class="badge bg-dark qty"><b>${cart[id]} </b></span>`); 
            }else{
                jQuery("#add-cart-btn-" + id).html(`add to cart`); 
            }
        }
        let catalog_container = document.getElementById("catalog"); // assuming your target is <div class='row' id='catalog'>
        jQuery(catalog_container).imagesLoaded( function() {
            var msnry = new Masonry(catalog_container); // this initializes the masonry container AFTER the product images are loaded
        });
        //if(this.notAttached){
        this.attach_events();
        //    this.notAttached = false;
       // }
        this.render_cart();
    }
    //validates all the forms in the checkout section and sends the orderData if all the forms are valid
    validateFormData(){
        let valid = true;
        //checks the currency selected
        if(this.selectedCurrency == '$'){
            this.orderData.currency = 'usd';
        }else if(this.selectedCurrency == 'CAD'){
            this.orderData.currency = 'cad';
        }else if(this.selectedCurrency == 'R$'){
            this.orderData.currency = 'brl';
        }
        if(!this.validateCreditCard()){
            valid = false;
        }
        if(!this.validateBillingForm()){
            valid = false;
        }
        if(!this.validateShippingForm()){
            valid = false;
        }

        //if valid it sends the data
        if(valid){
            let submission_data = this.orderData;
            let form_data = new FormData();
            form_data.append('submission', JSON.stringify(submission_data));

            $("#response-modal-title").html('<p>Submission successful</p>');
                    $("#response-modal-body").html(`<div class="ratio ratio-1x1"><video id="video_F" autoplay muted loop>
                    <source src="includes/WR-Crow-T.mp4" type="video/mp4">
                    </video></div>`);
                    $("#response-modal").modal('show');
                    document.getElementById("empty_cart_btn").click();
                    document.getElementById("checkout-close-btn").click();

            // Submission to the server for validation (No longer in use):

            /*
            fetch('https://deepblue.camosun.bc.ca/~c0180354/ics128/final/', 
            { method: "POST", 
                cache: 'no-cache', 
                body: form_data
            }).then(response => response.json()).
            then( data => {
                this.response = data;
                //if the submission is not successful, an error modal is open with the returned errors
                if(this.response.status == "NOT SUBMITTED"){
                    $("#response-modal-body").html('');



                    //Checks the errors, highlights the fields that contain an error and sends you to the page of the invalid fields

                    $("#response-modal-title").html('<p>Invalid Information</p>');
                    if(this.response.error.card_number !== undefined){
                        $("#response-modal-body").append(`<p>${this.response.error.card_number}</p>`);
                        $("#cardNumber").removeClass("is-valid");
                        $("#cardNumber").addClass("is-invalid");
                        document.getElementById("payment-tab-btn").click();
                    }
                    if(this.response.error.security_code !== undefined){
                        $("#response-modal-body").append(`<p>${this.response.error.security_code}</p>`);
                        $("#cvv").removeClass("is-valid");
                        $("#cvv").addClass("is-invalid");
                        document.getElementById("payment-tab-btn").click();
                    }
                    if(this.response.error.billing !== undefined && this.response.error.billing.email !== undefined){
                        $("#response-modal-body").append(`<p>${this.response.error.billing.email} (billing section)</p>`);
                        $("#billing-email").removeClass("is-valid");
                        $("#billing-email").addClass("is-invalid");
                        document.getElementById("billing-tab-btn").click();
                    }
                    if(this.response.error.billing !== undefined && this.response.error.billing.province !== undefined){
                        $("#response-modal-body").append(`<p>${this.response.error.billing.province} (billing section)</p>`);
                        $("#billing-province").removeClass("is-valid");
                        $("#billing-province").addClass("is-invalid");
                        document.getElementById("billing-tab-btn").click();
                    }
                    if(this.response.error.billing !== undefined && this.response.error.billing.province == "Please provide a valid country (Specify Either US or CA)"){
                        $("#response-modal-body").append(`<p>${this.response.error.billing.country} (billing section)</p>`);
                        $("#billing-country").removeClass("is-valid");
                        $("#billing-country").addClass("is-invalid");
                        document.getElementById("billing-tab-btn").click();
                    }
                    if(this.response.error.billing !== undefined && this.response.error.billing.state !== undefined){
                        $("#response-modal-body").append(`<p>${this.response.error.billing.state} (billing section)</p>`);
                        $("#billing-province").removeClass("is-valid");
                        $("#billing-province").addClass("is-invalid");
                        document.getElementById("billing-tab-btn").click();
                    }
                    if(this.response.error.billing !== undefined && this.response.error.billing.city !== undefined){
                        $("#response-modal-body").append(`<p>${this.response.error.billing.city} (billing section)</p>`);
                        $("#billing-city").removeClass("is-valid");
                        $("#billing-city").addClass("is-invalid");
                        document.getElementById("billing-tab-btn").click();
                    }
                    if(this.response.error.billing !== undefined && this.response.error.billing.postal !== undefined){
                        $("#response-modal-body").append(`<p>${this.response.error.billing.postal} (billing section)</p>`);
                        $("#billing-postal-code").removeClass("is-valid");
                        $("#billing-postal-code").addClass("is-invalid");
                        document.getElementById("billing-tab-btn").click();
                    }
                    if(this.response.error.shipping !== undefined && this.response.error.shipping.province !== undefined){
                        $("#response-modal-body").append(`<p>${this.response.error.shipping.province} (shipping section)</p>`);
                        $("#shipping-province").removeClass("is-valid");
                        $("#shipping-province").addClass("is-invalid");
                        document.getElementById("shipping-tab-btn").click();
                    }
                    if(this.response.error.shipping !== undefined && this.response.error.shipping.province == 'Please provide a valid country'){
                        $("#response-modal-body").append(`<p>${this.response.error.shipping.province} (shipping section)</p>`);
                        $("#shipping-country").removeClass("is-valid");
                        $("#shipping-country").addClass("is-invalid");
                        document.getElementById("shipping-tab-btn").click();
                    }
                    if(this.response.error.shipping !== undefined && this.response.error.shipping.city !== undefined){
                        $("#response-modal-body").append(`<p>${this.response.error.shipping.city} (shipping section)</p>`);
                        $("#shipping-city").removeClass("is-valid");
                        $("#shipping-city").addClass("is-invalid");
                        document.getElementById("shipping-tab-btn").click();
                    }
                    if(this.response.error.shipping !== undefined && this.response.error.shipping.postal !== undefined){
                        $("#response-modal-body").append(`<p>${this.response.error.shipping.postal} (shipping section)</p>`);
                        $("#shipping-postal-code").removeClass("is-valid");
                        $("#shipping-postal-code").addClass("is-invalid");
                        document.getElementById("shipping-tab-btn").click();
                    }
                    if(this.response.error.shipping !== undefined && this.response.error.shipping.state !== undefined){
                        $("#response-modal-body").append(`<p>${this.response.error.shipping.state} (shipping section)</p>`);
                        $("#shipping-province").removeClass("is-valid");
                        $("#shipping-province").addClass("is-invalid");
                        document.getElementById("shipping-tab-btn").click();
                    }
                    $("#response-modal").modal('show');
                }else if(this.response.status == "SUCCESS"){
                    $("#response-modal-title").html('<p>Submission successful</p>');
                    $("#response-modal-body").html(`<div class="ratio ratio-1x1"><video id="video_F" autoplay muted loop>
                    <source src="includes/WR-Crow-T.mp4" type="video/mp4">
                    </video></div>`);
                    $("#response-modal").modal('show');
                    document.getElementById("empty_cart_btn").click();
                    document.getElementById("checkout-close-btn").click();
                }
                
            });
            */

        }else{
            $("#response-modal-body").html('');
            $("#response-modal-body").html('Invalid Information. Be sure to fill all the fields correctly.');
            $("#response-modal").modal('show');
        };
        
    }
    
    //validates the card information provided in the checkout section
    validateCreditCard(){
        let month = $("#month").val();
        let year = $("#year").val();
        let cvv = $("#cvv").val();
        let valid = true;

        console.log(`month: ${month}, year: ${year}`);

        if(!this.validateCreditCardNumber()){
            valid = false;
            $("#cardNumber").removeClass("is-valid");
            $("#cardNumber").addClass("is-invalid");
        }else{
            $("#cardNumber").removeClass("is-invalid");
            $("#cardNumber").addClass("is-valid");
        }
        if(!this.validateMonth(month)){
            valid = false;
            $("#month").removeClass("is-valid");
            $("#month").addClass("is-invalid");
        }else{
            $("#month").removeClass("is-invalid");
            $("#month").addClass("is-valid");
        }
        if(!this.validateYear(year)){
            valid = false;
            $("#year").removeClass("is-valid");
            $("#year").addClass("is-invalid");
        }else{
            $("#year").removeClass("is-invalid");
            $("#year").addClass("is-valid");
        }
        // if(!this.validateDate(month,year)){
        //     valid = false;
        //     $("#month").removeClass("is-valid");
        //     $("#month").addClass("is-invalid");
        //     $("#year").removeClass("is-valid");
        //     $("#year").addClass("is-invalid");
        // }else{
        //     $("#month").removeClass("is-invalid");
        //     $("#month").addClass("is-valid");
        //     $("#year").removeClass("is-invalid");
        //     $("#year").addClass("is-valid");
        // }
        if(!this.validateCVV(cvv)){
            valid = false;
            $("#cvv").removeClass("is-valid");
            $("#cvv").addClass("is-invalid");
        }else{
            $("#cvv").removeClass("is-invalid");
            $("#cvv").addClass("is-valid");
        }

        //Adds the information to the orderData if the fields are valid
        if(valid){
            this.orderData["expiry_month"] = month;
            this.orderData["expiry_year"] = year;
            this.orderData["security_code"] = cvv;
        }
        return valid;
    }
    //checks if the card number has the correct length
    validateCreditCardNumber(){
        let valid = true;
        let cardNum = $("#cardNumber").val();
        if(cardNum.length == 16){
            this.orderData["card_number"] = cardNum;
            return valid;
        }else{
            valid = false;
        }
        return valid;
    }
    //validates the shipping form and changes the fields to red or green depending on the validation
    validateShippingForm(){
        let valid = true;
        let fNameB = $("#first-name-shipping").val();
        let lNameB = $("#last-name-shipping").val();
        let addressB = $("#shipping-address").val();
        let addressB2 = $("#shipping-address2").val();
        let cityB = $("#shipping-city").val();
        let provinceB = $("#shipping-province").val();
        let countryB = $("#shipping-country").val();
        let postalCodeB = $("#shipping-postal-code").val();
        if(!this.validateName(fNameB)){
            valid = false;
            $("#first-name-shipping").removeClass("is-valid");
            $("#first-name-shipping").addClass("is-invalid");
        }else{
            $("#first-name-shipping").removeClass("is-invalid");
            $("#first-name-shipping").addClass("is-valid");
        }
        if(!this.validateName(lNameB)){
            valid = false;
            $("#last-name-shipping").removeClass("is-valid");
            $("#last-name-shipping").addClass("is-invalid");
        }else{
            $("#last-name-shipping").removeClass("is-invalid");
            $("#last-name-shipping").addClass("is-valid");
        }
        if(!this.validateAddress(addressB)){
            valid = false;
            $("#shipping-address").removeClass("is-valid");
            $("#shipping-address").addClass("is-invalid");
        }else{
            $("#shipping-address").removeClass("is-invalid");
            $("#shipping-address").addClass("is-valid");
        }
        if(!this.validateAddress(addressB2)){
            valid = false;
            $("#shipping-address2").removeClass("is-valid");
            $("#shipping-address2").addClass("is-invalid");
        }else{
            $("#shipping-address2").removeClass("is-invalid");
            $("#shipping-address2").addClass("is-valid");
        }
        if(!this.validateCity(cityB)){
            valid = false;
            $("#shipping-city").removeClass("is-valid");
            $("#shipping-city").addClass("is-invalid");
        }else{
            $("#shipping-city").removeClass("is-invalid");
            $("#shipping-city").addClass("is-valid");
        }
        if(!this.validateProvince(provinceB)){
            valid = false;
            $("#shipping-province").removeClass("is-valid");
            $("#shipping-province").addClass("is-invalid");
        }else{
            $("#shipping-province").removeClass("is-invalid");
            $("#shipping-province").addClass("is-valid");
        }
        if(!this.validateCountry(countryB)){
            valid = false;
            $("#shipping-country").removeClass("is-valid");
            $("#shipping-country").addClass("is-invalid");
        }else{
            $("#shipping-country").removeClass("is-invalid");
            $("#shipping-country").addClass("is-valid");
        }
        if(!this.validatePostalCode(postalCodeB)){
            valid = false;
            $("#shipping-postal-code").removeClass("is-valid");
            $("#shipping-postal-code").addClass("is-invalid");
        }else{
            $("#shipping-postal-code").removeClass("is-invalid");
            $("#shipping-postal-code").addClass("is-valid");
        }
        if(valid){ //if valid saves the data in the object 

            this.orderData["shipping"].first_name = fNameB;
            this.orderData["shipping"].last_name = lNameB;
            this.orderData["shipping"].address_1 = addressB;
            this.orderData["shipping"].address_2 = addressB2;
            this.orderData["shipping"].city = cityB;
            this.orderData["shipping"].province = provinceB;
            this.orderData["shipping"].country = countryB;
            this.orderData["shipping"].postal = postalCodeB;
            
        }
        //if the checkbox "shiping-copy-billing" is checked, if it is the data collected in the billing section is copied to the shipping and the form is hidden
        if($("#shipping-copy-billing").is(":checked") && this.validateBillingForm()){
            valid = true;
            this.orderData["shipping"].first_name = $("#first-name-billing").val();
            this.orderData["shipping"].last_name = $("#last-name-billing").val();
            this.orderData["shipping"].address_1 = $("#billing-address").val();
            this.orderData["shipping"].address_2 = $("#billing-address2").val();
            this.orderData["shipping"].city = $("#billing-city").val();
            this.orderData["shipping"].province = $("#billing-province").val();
            this.orderData["shipping"].country = $("#billing-country").val();
            this.orderData["shipping"].postal = $("#billing-postal-code").val();
        }
        return valid;
    }
   
    //validates the billing form and sets the fields red or green based on the validation
    validateBillingForm(){
        let valid = true;
        let fNameB = $("#first-name-billing").val();
        let lNameB = $("#last-name-billing").val();
        let addressB = $("#billing-address").val();
        let addressB2 = $("#billing-address2").val();
        let cityB = $("#billing-city").val();
        let provinceB = $("#billing-province").val();
        let countryB = $("#billing-country").val();
        let postalCodeB = $("#billing-postal-code").val();
        let phoneB = $("#billing-phone").val();
        let emailB = $("#billing-email").val();
        if(!this.validateEmail(emailB)){
            valid = false;
            $("#billing-email").removeClass("is-valid");
            $("#billing-email").addClass("is-invalid");
        }else{
            $("#billing-email").removeClass("is-invalid");
            $("#billing-email").addClass("is-valid");
        }
        if(!this.validateName(fNameB)){
            valid = false;
            $("#first-name-billing").removeClass("is-valid");
            $("#first-name-billing").addClass("is-invalid");
        }else{
            $("#first-name-billing").removeClass("is-invalid");
            $("#first-name-billing").addClass("is-valid");
        }
        if(!this.validateName(lNameB)){
            valid = false;
            $("#last-name-billing").removeClass("is-valid");
            $("#last-name-billing").addClass("is-invalid");
        }else{
            $("#last-name-billing").removeClass("is-invalid");
            $("#last-name-billing").addClass("is-valid");
        }
        if(!this.validateAddress(addressB)){
            valid = false;
            $("#billing-address").removeClass("is-valid");
            $("#billing-address").addClass("is-invalid");
        }else{
            $("#billing-address").removeClass("is-invalid");
            $("#billing-address").addClass("is-valid");
        }
        if(!this.validateAddress(addressB2)){
            valid = false;
            $("#billing-address2").removeClass("is-valid");
            $("#billing-address2").addClass("is-invalid");
        }else{
            $("#billing-address2").removeClass("is-invalid");
            $("#billing-address2").addClass("is-valid");
        }
        if(!this.validateCity(cityB)){
            valid = false;
            $("#billing-city").removeClass("is-valid");
            $("#billing-city").addClass("is-invalid");
        }else{
            $("#billing-city").removeClass("is-invalid");
            $("#billing-city").addClass("is-valid");
        }
        if(!this.validateProvince(provinceB)){
            valid = false;
            $("#billing-province").removeClass("is-valid");
            $("#billing-province").addClass("is-invalid");
        }else{
            $("#billing-province").removeClass("is-invalid");
            $("#billing-province").addClass("is-valid");
        }
        if(!this.validateCountry(countryB)){
            valid = false;
            $("#billing-country").removeClass("is-valid");
            $("#billing-country").addClass("is-invalid");
        }else{
            $("#billing-country").removeClass("is-invalid");
            $("#billing-country").addClass("is-valid");
        }
        if(!this.validatePostalCode(postalCodeB)){
            valid = false;
            $("#billing-postal-code").removeClass("is-valid");
            $("#billing-postal-code").addClass("is-invalid");
        }else{
            $("#billing-postal-code").removeClass("is-invalid");
            $("#billing-postal-code").addClass("is-valid");
        }
        if(!this.validatePhone(phoneB)){
            valid = false;
            $("#billing-phone").removeClass("is-valid");
            $("#billing-phone").addClass("is-invalid");
        }else{
            $("#billing-phone").removeClass("is-invalid");
            $("#billing-phone").addClass("is-valid");
        }
        //if valid the data is saved in the orderData object
        if(valid){

            this.orderData["billing"].first_name = fNameB;
            this.orderData["billing"].last_name = lNameB;
            this.orderData["billing"].address_1 = addressB;
            this.orderData["billing"].address_2 = addressB2;
            this.orderData["billing"].city = cityB;
            this.orderData["billing"].province = provinceB;
            this.orderData["billing"].country = countryB;
            this.orderData["billing"].postal = postalCodeB;
            this.orderData["billing"].phone = phoneB;
            this.orderData["billing"].email = emailB;
            
        }

        return valid;
    }
    
    //validates the email to check if it contains a valid format
    validateEmail(email){
        let v = false;
        let re =  /^([0-9a-zA-Z\.!#$%&'*+\-/=?^_`{|}~]+)@([a-zA-Z0-9])+\.([a-z]+)(.[a-z]+)?$/;
        if(re.test(email)){
   
            v = true;
        }else{

            v = false;
        }
        return v;
    }
    //checks if the name provided is longer than 2 characters
    validateName(name){
        if(name.length>2){
            return true;
        }
        return false;
    }
    //checs if the month is between 1-12 and if the year is above 2022 (I know it is not ideal)
    validateDate(month,year){
        let v = true;
        let re = /[0-1][0-9]/;
        if(re.test(month)){
            v = true;
        }else{
            v = false;
        }
        if(month > 0 && month < 13 && year >= 2022 && year <= 2036){
            return true;
        }
        return false;
    }

    validateMonth(month){
        let v = true;

        // Regex used to check if variable month has 2 digits
        let re = /[0-1][0-9]/;
        if(re.test(month)){
            v = true;
        }else{
            v = false;
        }
        if(month > 0 && month < 13){
            return true;
        }
        return false;
    }

    validateYear(year){
        return year > 2024
    }

    //checks if the address provided is longer than 5 characters
    validateAddress(address){
        if(address.length > 5){
            return true;
        }
        return false;
    }
    //checks if the city provided is longer than 2 characters
    validateCity(city){
        if(city.length > 2){
            return true;
        }
        return false;
    }


    //checks for an abreviation of a province/state name
    validateProvince(p){
        if(p.length == 2){
            catalog.calculateTaxes();
            catalog.render_cart();
            return true;
        }
        return false;
    }
    //checks for the abreviation of a country name
    validateCountry(c){
        if(c.length > 1){
            return true;
        }
        return false;
    }
    //checks if postal code is longer than 2 charcters
    validatePostalCode(p){
        if(p.length > 2){
            return true;
        }
        return false;
    }
    //checks if the phone provided has a valid north american format
    validatePhone(phone){
        let v = false;
        let reg = /^([2-9][\d][\d])[ -]?[\d][\d][\d][ -]?[\d][\d][\d][\d]$/;//first digit can't be 0 or 1
        if(reg.test(phone)){
            v = true;
        }else{
            v = false;
        }
        return v;
    }
    //check the lenght of the cvv
    validateCVV(cvv){
        if(cvv.length == 3){
            return true;
        }
        return false;
    }

    //attaches the events (click and change events)
    attach_events(){

        //listens for the checkbox
        $("#shipping-copy-billing").change( () => {

            if($("#shipping-copy-billing").is(":checked")){
                $("#shipping-form").hide();
            }else{
                $("#shipping-form").show();
            }
        });

        //validates the fields everytime the values change
        $("#billing-phone").change(() =>{
            if (catalog.validatePhone($("#billing-phone").val())){
                $("#billing-phone").removeClass("is-invalid");
                $("#billing-phone").addClass("is-valid");
            }else{
                $("#billing-phone").removeClass("is-valid");
                $("#billing-phone").addClass("is-invalid");
            };
        });
        $("#first-name-billing").change(() =>{
            if (catalog.validateName($("#first-name-billing").val())){
                $("#first-name-billing").removeClass("is-invalid");
                $("#first-name-billing").addClass("is-valid");
            }else{
                $("#first-name-billing").removeClass("is-valid");
                $("#first-name-billing").addClass("is-invalid");
            };
        });
        $("#last-name-billing").change(() =>{
            if (catalog.validateName($("#last-name-billing").val())){
                $("#last-name-billing").removeClass("is-invalid");
                $("#last-name-billing").addClass("is-valid");
            }else{
                $("#last-name-billing").removeClass("is-valid");
                $("#last-name-billing").addClass("is-invalid");
            };
        });
        $("#billing-address").change(() =>{
            if (catalog.validateAddress($("#billing-address").val())){
                $("#billing-address").removeClass("is-invalid");
                $("#billing-address").addClass("is-valid");
            }else{
                $("#billing-address").removeClass("is-valid");
                $("#billing-address").addClass("is-invalid");
            };
        });
        $("#billing-address2").change(() =>{
            if (catalog.validateAddress($("#billing-address2").val())){
                $("#billing-address2").removeClass("is-invalid");
                $("#billing-address2").addClass("is-valid");
            }else{
                $("#billing-address2").removeClass("is-valid");
                $("#billing-address2").addClass("is-invalid");
            };
        });
        $("#billing-city").change(() =>{
            if (catalog.validateCity($("#billing-city").val())){
                $("#billing-city").removeClass("is-invalid");
                $("#billing-city").addClass("is-valid");
            }else{
                $("#billing-city").removeClass("is-valid");
                $("#billing-city").addClass("is-invalid");
            };
        });
        $("#billing-province").change(() =>{
            if (catalog.validateProvince($("#billing-province").val())){
                $("#billing-province").removeClass("is-invalid");
                $("#billing-province").addClass("is-valid");
            }else{
                $("#billing-province").removeClass("is-valid");
                $("#billing-province").addClass("is-invalid");
            };
        });
        $("#billing-country").change(() =>{
            if (catalog.validateCountry($("#billing-country").val())){
                $("#billing-country").removeClass("is-invalid");
                $("#billing-country").addClass("is-valid");
            }else{
                $("#billing-country").removeClass("is-valid");
                $("#billing-country").addClass("is-invalid");
            };
        });
        $("#billing-postal-code").change(() =>{
            if (catalog.validatePostalCode($("#billing-postal-code").val())){
                $("#billing-postal-code").removeClass("is-invalid");
                $("#billing-postal-code").addClass("is-valid");
            }else{
                $("#billing-postal-code").removeClass("is-valid");
                $("#billing-postal-code").addClass("is-invalid");
            };
        });
        


        $("#first-name-shipping").change(() =>{
            if (catalog.validateName($("#first-name-shipping").val())){
                $("#first-name-shipping").removeClass("is-invalid");
                $("#first-name-shipping").addClass("is-valid");
            }else{
                $("#first-name-shipping").removeClass("is-valid");
                $("#first-name-shipping").addClass("is-invalid");
            };
        });
        $("#last-name-shipping").change(() =>{
            if (catalog.validateName($("#last-name-shipping").val())){
                $("#last-name-shipping").removeClass("is-invalid");
                $("#last-name-shipping").addClass("is-valid");
            }else{
                $("#last-name-shipping").removeClass("is-valid");
                $("#last-name-shipping").addClass("is-invalid");
            };
        });
        $("#shipping-address").change(() =>{
            if (catalog.validateAddress($("#shipping-address").val())){
                $("#shipping-address").removeClass("is-invalid");
                $("#shipping-address").addClass("is-valid");
            }else{
                $("#shipping-address").removeClass("is-valid");
                $("#shipping-address").addClass("is-invalid");
            };
        });
        $("#shipping-address2").change(() =>{
            if (catalog.validateAddress($("#shipping-address2").val())){
                $("#shipping-address2").removeClass("is-invalid");
                $("#shipping-address2").addClass("is-valid");
            }else{
                $("#shipping-address2").removeClass("is-valid");
                $("#shipping-address2").addClass("is-invalid");
            };
        });
        $("#shipping-city").change(() =>{
            if (catalog.validateCity($("#shipping-city").val())){
                $("#shipping-city").removeClass("is-invalid");
                $("#shipping-city").addClass("is-valid");
            }else{
                $("#shipping-city").removeClass("is-valid");
                $("#shipping-city").addClass("is-invalid");
            };
        });
        $("#shipping-province").change(() =>{
            if (catalog.validateProvince($("#shipping-province").val())){
                $("#shipping-province").removeClass("is-invalid");
                $("#shipping-province").addClass("is-valid");
            }else{
                $("#billing-province").removeClass("is-valid");
                $("#billing-province").addClass("is-invalid");
            };
        });
        $("#shipping-country").change(() =>{
            if (catalog.validateCountry($("#shipping-country").val())){
                $("#shipping-country").removeClass("is-invalid");
                $("#shipping-country").addClass("is-valid");
            }else{
                $("#shipping-country").removeClass("is-valid");
                $("#shipping-country").addClass("is-invalid");
            };
        });
        $("#shipping-postal-code").change(() =>{
            if (catalog.validatePostalCode($("#shipping-postal-code").val())){
                $("#shipping-postal-code").removeClass("is-invalid");
                $("#shipping-postal-code").addClass("is-valid");
            }else{
                $("#shipping-postal-code").removeClass("is-valid");
                $("#shipping-postal-code").addClass("is-invalid");
            };
        });

        $("#cardNumber").change(() =>{
            if (catalog.validateCreditCardNumber()){
                $("#cardNumber").removeClass("is-invalid");
                $("#cardNumber").addClass("is-valid");
            }else{
                $("#cardNumber").removeClass("is-valid");
                $("#cardNumber").addClass("is-invalid");
            };
        });

        $("#cvv").change(() =>{
            if (catalog.validateCVV($("#cvv").val())){
                $("#cvv").removeClass("is-invalid");
                $("#cvv").addClass("is-valid");
            }else{
                $("#cvv").removeClass("is-valid");
                $("#cvv").addClass("is-invalid");
            };
        });

        $("#month").change(() =>{
            if (catalog.validateMonth($("#month").val())){
                $("#month").removeClass("is-invalid");
                $("#month").addClass("is-valid");
            }else{
                $("#month").removeClass("is-valid");
                $("#month").addClass("is-invalid");
            };
        });

        $("#year").change(() =>{
            if (catalog.validateYear($("#year").val())){
                $("#year").removeClass("is-invalid");
                $("#year").addClass("is-valid");
            }else{
                $("#year").removeClass("is-valid");
                $("#year").addClass("is-invalid");
            };
        });



        $("#billing-email").change(() => {
            if (catalog.validateEmail($("#billing-email").val())){
                $("#billing-email").removeClass("is-invalid");
                $("#billing-email").addClass("is-valid");
            }else{
                $("#billing-email").removeClass("is-valid");
                $("#billing-email").addClass("is-invalid");
            };
        });

        $("#shipping-email").change(() => {
            if (catalog.validateEmail($("#shipping-email").val())){
                $("#shipping-email").removeClass("is-invalid");
                $("#shipping-email").addClass("is-valid");
            }else{
                $("#shipping-email").removeClass("is-valid");
                $("#shipping-email").addClass("is-invalid");
            };
        });
        //adds item to cart
        jQuery(".add-to-cart-button").click(function addToCart() {
            // get the product id from a data attribute of the button that looks like this:
            // Add To Cart
            var product_id = jQuery(this).attr("data-id"); 
            var cart_items = get_cookie("shopping_cart_items"); // get the data stored as a "cookie"
            
            // initialize the cart items if it returns null
            if (cart_items === null) {
                cart_items = {};
            }
            // make sure the object is defined;
            if (cart_items[product_id] === undefined) {
                cart_items[product_id] = 0;
            }
            cart_items[product_id]++;
            set_cookie("shopping_cart_items", cart_items); // setting the cart items back to the "cookie" storage
            catalog.render_cart();
            jQuery(this).html("");
            jQuery(this).html(`add to cart   <span class="badge bg-dark qty"><b>${cart_items[product_id]}</b></span>`);
        });

        
        

    }

    attach_cart_events(){
        //checks the province selected when the checkout button is clicked to apply the correct amount of taxes
        $("#goToCheckout").click( () => {
            catalog.validateProvince($("#billing-province"));
        })
        //resets the cart to an empty object if the empty cart button ic clicked and re-renders the cart
        jQuery("#empty_cart_btn").click(function empty_cart(){
            let cart = {};
            set_cookie("shopping_cart_items", cart);
            catalog.render_cart();
            //resets the quantity badger to nothing
            jQuery(".qty").html("");
        });
        //removes an item in the cart based on its id
        jQuery(".remove_item").click(function removeItem(){
            let cartItems = get_cookie("shopping_cart_items");
            let id = jQuery(this).attr("itemId");
            let qty = cartItems[id];
            if(cartItems[id] != 1){
                cartItems[id]--;
            }else{
                delete cartItems[id];
            }
            set_cookie("shopping_cart_items", cartItems);
            catalog.render_cart();
            catalog.render_page();
            catalog.attach_events()
        });

        

    }

}
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});

function cssFunction(){
    window.location.href = "https://media.printables.com/media/prints/163302/images/1518009_d912c057-089c-4050-b4ba-fea17016ca09/thumbs/cover/1280x960/png/worldsbest.webp";
}

//validates the credit cart information when the billing tab is clicked
$("#billing-tab-btn").click( (e) => {
    e.preventDefault();
    catalog.validateCreditCard();
})
//next button for the payment page. it validates the fields in the form and goes to the next section if the current form is valid 
$("#payment-next-btn").click( (event) => {
    event.preventDefault();
    if(catalog.validateCreditCard()){
        document.getElementById("billing-tab-btn").click();
    }   
})
//next button for the billing page. it validates the fields in the form and goes to the next section if the current form is valid 
$("#billing-next-btn").click( (event) => {
    event.preventDefault();
    if(catalog.validateBillingForm()){
        document.getElementById("shipping-tab-btn").click();
    }
});

$("#billing-prev-btn").click( (event) => {
    event.preventDefault();
    document.getElementById("payment-tab-btn").click();
});
$("#shipping-prev-btn").click( (event) => {
    event.preventDefault();
    document.getElementById("billing-tab-btn").click();
});
//next button for the shipping page. it validates the fields in the form and goes to the next section if the current form is valid 
$("#shipping-next-btn").click( (event) => {
    event.preventDefault();
    if(catalog.validateShippingForm()){
        document.getElementById("confirmation-tab-btn").click(); 
    }  
});
//validates the shipping and the billing forms when the confirmation tab is clicked
$("#confirmation-tab-btn").click( () => {
    catalog.validateShippingForm();
    catalog.validateBillingForm();   
})
//prev button 
$("#confirmation-prev-btn").click( (event) => {
    event.preventDefault();
    document.getElementById("shipping-tab-btn").click();
});

//creates the catalog object
 let catalog = new Catalog();
 if(get_cookie("shopping_cart_items" == null)){
    set_cookie("shopping_cart_items", {});
 }

 var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
});

jQuery(".dropdown-item").click(function currencySelector(){
    let currency = jQuery(this).attr("currency");

    // Rates as of May 2025

    let cad = 1;
    let brl = 4.08;
    let usd = 0.72;

    if(catalog.selectedCurrency != currency){
        catalog.selectedCurrency = catalog.currencySymbol[currency];
        console.log(`Catalog.selectedCurrency = ${catalog.selectedCurrency}`);

        // Currency api currently offline
        // The following if sequence is to replace its functionality:

        if(catalog.selectedCurrency == "CAD"){
            catalog.currencyMultiplier = cad;
        }else if(catalog.selectedCurrency == "R$"){
            catalog.currencyMultiplier = brl;
        }else{
            catalog.currencyMultiplier = usd;
        }
        //catalog.currencyMultiplier = catalog.currencyData.cad[currency];
        catalog.render_page();
        catalog.render_cart();
    }
});

function updateCurrencyMultiplier(){
    let btn = jQuery(".dropdown-item");
    console.log(btn);
}
