document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const productCheckboxes = document.querySelectorAll('.product-checkbox');
    const productItems = document.querySelectorAll('.product-item');
    const checkoutSection = document.getElementById('checkoutSection');
    const selectedProductsContainer = document.getElementById('selectedProducts');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const checkoutForm = document.getElementById('checkoutForm');
    const paymentMethods = document.querySelectorAll('.payment-method');
    const cardDetails = document.getElementById('cardDetails');
    const paypalEmail = document.getElementById('paypalEmail');
    const bkashInstructions = document.getElementById('bkashInstructions');
    const successModal = document.getElementById('successModal');
    const closeModal = document.getElementById('closeModal');
    const orderSummary = document.getElementById('orderSummary');
    const checkoutButton = document.getElementById('checkoutButton');
    const buttonText = document.getElementById('buttonText');
    const spinner = document.getElementById('spinner');
    const bkashReference = document.getElementById('bkashReference');

    // State
    let selectedProducts = [];
    let selectedPaymentMethod = 'paypal';

    // Generate random bKash reference
    function generateBkashReference() {
        return `ORD${Math.floor(1000 + Math.random() * 9000)}`;
    }
    bkashReference.textContent = generateBkashReference();

    // Initialize quantity controls
    productItems.forEach(item => {
        const checkbox = item.querySelector('.product-checkbox');
        const quantityControls = item.querySelector('.quantity-control');
        const minusBtn = item.querySelector('.quantity-minus');
        const plusBtn = item.querySelector('.quantity-plus');
        const quantityElement = item.querySelector('.quantity');

        checkbox.addEventListener('change', function () {
            if (this.checked) {
                quantityControls.classList.remove('hidden');
                item.classList.add('ring-2', 'ring-cyan-400');
                addProductToSelection(item);
            } else {
                quantityControls.classList.add('hidden');
                item.classList.remove('ring-2', 'ring-cyan-400');
                removeProductFromSelection(item.dataset.id);
            }
            updateCheckoutSection();
        });

        minusBtn.addEventListener('click', function () {
            let quantity = parseInt(quantityElement.textContent);
            if (quantity > 1) {
                quantity--;
                quantityElement.textContent = quantity;
                updateProductQuantity(item.dataset.id, quantity);
                updateTotals();
            }
        });

        plusBtn.addEventListener('click', function () {
            let quantity = parseInt(quantityElement.textContent);
            quantity++;
            quantityElement.textContent = quantity;
            updateProductQuantity(item.dataset.id, quantity);
            updateTotals();
        });
    });

    // Add product to selection
    function addProductToSelection(item) {
        const productId = item.dataset.id;
        const productName = item.querySelector('h4').textContent;
        const productPrice = parseFloat(item.dataset.price);
        const productImage = item.querySelector('img').src;

        // Check if product already exists
        const existingProduct = selectedProducts.find(p => p.id === productId);
        if (!existingProduct) {
            selectedProducts.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
        }
        updateTotals();
    }

    // Remove product from selection
    function removeProductFromSelection(productId) {
        selectedProducts = selectedProducts.filter(p => p.id !== productId);
        if (selectedProducts.length === 0) {
            checkoutSection.classList.add('hidden');
        }
        updateTotals();
    }

    // Update product quantity
    function updateProductQuantity(productId, quantity) {
        const product = selectedProducts.find(p => p.id === productId);
        if (product) {
            product.quantity = quantity;
        }
        updateSelectedProductsDisplay();
        updateTotals();
    }

    // Update checkout section visibility
    function updateCheckoutSection() {
        if (selectedProducts.length > 0) {
            checkoutSection.classList.remove('hidden');
            updateSelectedProductsDisplay();
        } else {
            checkoutSection.classList.add('hidden');
        }
    }

    // Update selected products display
    function updateSelectedProductsDisplay() {
        selectedProductsContainer.innerHTML = '';
        selectedProducts.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'flex items-center justify-between p-3 bg-cyan-50 rounded-lg border border-cyan-100 animate-fade-in';
            productElement.innerHTML = `
                        <div class="flex items-center space-x-3">
                            <img src="${product.image}" alt="${product.name}" class="w-12 h-12 rounded-lg object-cover">
                            <div>
                                <h4 class="text-sm font-medium text-cyan-800">${product.name}</h4>
                                <p class="text-xs text-cyan-600">Qty: ${product.quantity}</p>
                            </div>
                        </div>
                        <span class="text-sm font-medium text-cyan-700">$${(product.price * product.quantity).toFixed(2)}</span>
                    `;
            selectedProductsContainer.appendChild(productElement);
        });
    }

    // Update totals
    function updateTotals() {
        let subtotal = 0;
        selectedProducts.forEach(product => {
            subtotal += product.price * product.quantity;
        });

        subtotalElement.textContent = subtotal.toFixed(2);
        totalElement.textContent = subtotal.toFixed(2);
    }

    // Payment method selection
    paymentMethods.forEach(method => {
        method.addEventListener('click', function () {
            // Remove active class from all buttons
            paymentMethods.forEach(btn => btn.classList.remove('active', 'bg-cyan-200', 'bKash-btn'));

            // Add active class to clicked button
            if (this.dataset.method === 'bkash') {
                this.classList.add('active', 'bKash-btn');
            } else {
                this.classList.add('active', 'bg-cyan-200');
            }
            selectedPaymentMethod = this.dataset.method;
            updatePaymentForm();
        });
    });

    // Update payment form based on selected method
    function updatePaymentForm() {
        // Hide all payment forms first
        cardDetails.classList.add('hidden');
        paypalEmail.classList.add('hidden');
        bkashInstructions.classList.add('hidden');

        // Show the relevant form
        if (selectedPaymentMethod === 'paypal') {
            paypalEmail.classList.remove('hidden');
        } else if (selectedPaymentMethod === 'bkash') {
            bkashInstructions.classList.remove('hidden');
            // Generate new reference when bKash is selected
            bkashReference.textContent = generateBkashReference();
        } else {
            cardDetails.classList.remove('hidden');
        }
    }

    // Form submission
    checkoutForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Validate bKash payment if selected
        if (selectedPaymentMethod === 'bkash') {
            const bkashNumber = document.getElementById('bkashNumber').value;
            const bkashTrxId = document.getElementById('bkashTrxId').value;

            if (!bkashNumber || !/^01\d{9}$/.test(bkashNumber)) {
                alert('Please enter a valid bKash number (11 digits starting with 01)');
                return;
            }

            if (!bkashTrxId || bkashTrxId.length < 8) {
                alert('Please enter a valid bKash transaction ID');
                return;
            }
        }

        // Show loading state
        checkoutButton.disabled = true;
        buttonText.textContent = 'Processing...';
        spinner.classList.remove('hidden');

        // Simulate API call
        setTimeout(() => {
            // Generate order summary
            let summaryHTML = '<div class="mb-4 font-medium text-cyan-800">Order Summary:</div>';
            selectedProducts.forEach(product => {
                summaryHTML += `
                            <div class="flex justify-between py-1 border-b border-cyan-100">
                                <span class="text-cyan-700">${product.name} (${product.quantity}x)</span>
                                <span class="text-cyan-700">$${(product.price * product.quantity).toFixed(2)}</span>
                            </div>
                        `;
            });
            summaryHTML += `
                        <div class="flex justify-between py-2 font-medium mt-2 text-cyan-800">
                            <span>Total</span>
                            <span>$${totalElement.textContent}</span>
                        </div>
                        <div class="mt-4 p-3 bg-cyan-50 rounded-lg border border-cyan-100">
                            <p class="text-sm text-cyan-700"><span class="font-medium">Payment Method:</span> ${getPaymentMethodName(selectedPaymentMethod)}</p>
                            ${selectedPaymentMethod === 'bkash' ? `
                                <p class="text-sm text-cyan-700 mt-1"><span class="font-medium">bKash Reference:</span> ${bkashReference.textContent}</p>
                                <p class="text-sm text-cyan-700 mt-1"><span class="font-medium">Transaction ID:</span> ${document.getElementById('bkashTrxId').value}</p>
                            ` : ''}
                        </div>
                    `;
            orderSummary.innerHTML = summaryHTML;

            // Show success modal
            successModal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');

            // Reset form
            checkoutButton.disabled = false;
            buttonText.textContent = 'Complete Purchase';
            spinner.classList.add('hidden');
        }, 1500);
    });

    // Helper function to get payment method name
    function getPaymentMethodName(method) {
        switch (method) {
            case 'card': return 'Credit/Debit Card';
            case 'paypal': return 'PayPal';
            case 'bkash': return 'bKash';
            default: return method;
        }
    }

    // Close modal
    closeModal.addEventListener('click', function () {
        successModal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');

        // Reset the entire checkout process
        selectedProducts = [];
        productCheckboxes.forEach(checkbox => checkbox.checked = false);
        document.querySelectorAll('.quantity-control').forEach(control => control.classList.add('hidden'));
        document.querySelectorAll('.quantity').forEach(q => q.textContent = '1');
        document.querySelectorAll('.product-item').forEach(item => item.classList.remove('ring-2', 'ring-cyan-400'));
        checkoutSection.classList.add('hidden');
    });

    // Input formatting
    document.getElementById('cardNumber').addEventListener('input', function (e) {
        let value = e.target.value.replace(/\s/g, '');
        if (value.length > 16) value = value.substring(0, 16);
        value = value.replace(/(\d{4})/g, '$1 ').trim();
        e.target.value = value;
    });

    document.getElementById('expiryDate').addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.substring(0, 4);
        if (value.length > 2) {
            value = value.substring(0, 2) + '/' + value.substring(2);
        }
        e.target.value = value;
    });

    document.getElementById('cvv').addEventListener('input', function (e) {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
    });

    // Initialize payment form
    updatePaymentForm();
});