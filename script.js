document.addEventListener("DOMContentLoaded", () => {
    const productsUrl = "http://127.0.0.1:5000/products";
    const categoryFilter = document.getElementById("category-filter");
    const productGrid = document.getElementById("product-grid");
    let allProducts = [];

    // Fltrare i prodotti
    const filterProducts = () => {
        const selectedCategory = categoryFilter.value;
        const filteredProducts = selectedCategory === "all" 
            ? allProducts 
            : allProducts.filter(product => product.category === selectedCategory);
        
        renderProducts(filteredProducts);
    };

    // Renderizzare i prodotti
    const renderProducts = (products) => {
        productGrid.innerHTML = "";
        products.forEach(product => {
            const card = createProductCard(product);
            productGrid.appendChild(card);
        });
    };

    // Creare card prodotto
    const createProductCard = (product) => {
        const card = document.createElement("div");
        card.className = "card";
        if (product.available === 0) card.classList.add("unavailable");
        
        const imagePath = `http://127.0.0.1:5000/images/${product.id}/01.jpg`;
        const priceParts = product.price.toFixed(2).split(".");
        const originalPriceParts = product.original 
            ? product.original.toFixed(2).split(".") 
            : null;

        card.innerHTML = `
            <img src="${imagePath}" alt="${product.name}" onerror="this.onerror=null; this.src='default.jpg';">
            <div class="card-body">
                <div class="card-productor">${product.productor} - ${product.category}</div>
                <div class="card-title">${product.name}</div>
                <div class="card-price">
                    ${product.original ? `
                        <span class="card-price-original">€${originalPriceParts[0]}.${originalPriceParts[1]}</span>
                        <span class="card-price-discount">€${priceParts[0]}<sup>${priceParts[1]}</sup></span>
                    ` : `
                        €${priceParts[0]}<sup>${priceParts[1]}</sup>
                    `}
                </div>
                <div class="card-description">${product.description}</div>
                <div class="card-availability ${product.available === 0 ? 'unavailable' : 'available'}">
                    ${product.available === 0 ? 'Non disponibile' : ``}
                </div>
            </div>
        `;

        card.addEventListener("click", () => {
            if (product.available > 0) {
                window.location.href = `product.html?id=${product.id}`;
            }
        });

        return card;
    };

    fetch(productsUrl)
        .then(response => response.json())
        .then(products => {
            allProducts = products;
            const categories = [...new Set(products.map(p => p.category))].filter(Boolean);
            categories.forEach(category => {
                const option = document.createElement("option");
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });
            categoryFilter.addEventListener("change", filterProducts);
            renderProducts(allProducts);
        })
        .catch(error => console.error("Errore nel caricamento dei prodotti.", error));
});