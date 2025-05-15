document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    const overlay = document.querySelector("#overlay");
    const fullscreenImage = document.querySelector("#fullscreen-image");

    if (productId) {
        const productDetailsUrl = `http://127.0.0.1:5000/product/${productId}`;

        fetch(productDetailsUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Errore nel recupero dei dettagli del prodotto: " + response.statusText);
                }
                return response.json();
            })
            .then(product => {
                if (product.error) {
                    document.body.innerHTML = "<h1>Prodotto non trovato</h1>";
                } else {
                    document.title = product.name;
                    const mainImage = document.querySelector("#main-image");
                    const thumbnailsContainer = document.querySelector(".thumbnails");
                    const quantityInput = document.querySelector("#quantity");
                    const incrementButton = document.querySelector("#increment");
                    const decrementButton = document.querySelector("#decrement");
                    const addToCartButton = document.querySelector("#add-to-cart");
                    const buyNowButton = document.querySelector("#buy-now");
                    if (quantityInput) {
                        quantityInput.addEventListener("keydown", (e) => {
                            e.preventDefault();
                        });

                        quantityInput.addEventListener("mousedown", (e) => {
                            e.preventDefault();
                        });

                        quantityInput.style.webkitAppearance = "none";
                        quantityInput.style.mozAppearance = "textfield";
                        quantityInput.classList.add("no-spinner");
                    }
                    document.querySelector(".product-title").textContent = product.name;
                    document.querySelector(".product-description").textContent = product.description;
                    const priceParts = product.price.toFixed(2).split(".");
                    const priceElement = document.querySelector(".product-price");
                    priceElement.innerHTML = `€${priceParts[0]}<sup>${priceParts[1]}</sup>`;
                    if (product.original) {
                        const originalParts = product.original.toFixed(2).split(".");
                        priceElement.innerHTML = `
                            <span class="card-price-original">€${originalParts[0]}.${originalParts[1]}</span>
                            <span class="card-price-discount">€${priceParts[0]}<sup>${priceParts[1]}</sup></span>
                        `;
                    }
                    const stockElement = document.querySelector(".product-stock");
                    if (product.available === 0) {
                        stockElement.textContent = "Non disponibile";
                        stockElement.style.color = "red";
                        if (quantityInput) quantityInput.disabled = true;
                        if (addToCartButton) addToCartButton.disabled = true;
                        if (buyNowButton) buyNowButton.disabled = true;
                    } else {
                        stockElement.textContent = `Disponibili: ${product.available}`;
                        stockElement.style.color = "green";
                        if (quantityInput) quantityInput.max = product.available;
                    }
                    const updateQuantityButtons = () => {
                        const quantity = parseInt(quantityInput.value);
                        decrementButton.disabled = quantity <= 1;
                        incrementButton.disabled = quantity >= product.available;
                    };
                    if (mainImage && thumbnailsContainer) {
                        thumbnailsContainer.innerHTML = "";
                        const images = Array.isArray(product.images) ? product.images : [];
                        if (images.length > 0) {
                            mainImage.src = `http://127.0.0.1:5000/images/${product.id}/${images[0]}`;
                            mainImage.alt = product.name;
                            if (images.length > 1) {
                                images.forEach((image, index) => {
                                    const thumbnail = document.createElement('img');
                                    thumbnail.classList.add('thumbnail');
                                    thumbnail.src = `http://127.0.0.1:5000/images/${product.id}/${image}`;
                                    thumbnail.alt = `Thumbnail ${index + 1}`;
                                    thumbnailsContainer.appendChild(thumbnail);

                                    thumbnail.addEventListener("click", () => {
                                        mainImage.src = thumbnail.src;
                                    });
                                });
                            }
                        } else {
                            mainImage.src = "default.jpg";
                            thumbnailsContainer.innerHTML = '<p>Nessuna immagine disponibile</p>';
                        }
                        mainImage.addEventListener("click", () => {
                            fullscreenImage.src = mainImage.src;
                            overlay.classList.add("active");
                            document.body.style.overflow = "hidden";
                        });
                    }

                    if (quantityInput && incrementButton && decrementButton) {
                        updateQuantityButtons(); // Imposta stato iniziale

                        incrementButton.addEventListener("click", () => {
                            let quantity = parseInt(quantityInput.value);
                            if (quantity < product.available) {
                                quantityInput.value = quantity + 1;
                                updateQuantityButtons();
                            }
                        });

                        decrementButton.addEventListener("click", () => {
                            let quantity = parseInt(quantityInput.value);
                            if (quantity > 1) {
                                quantityInput.value = quantity - 1;
                                updateQuantityButtons();
                            }
                        });
                    }

                    if (addToCartButton) {
                        addToCartButton.addEventListener("click", () => {
                            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
                            console.log(`Aggiunto al carrello: ${product.name}, Quantità: ${quantity}`);
                            alert(`Aggiunto al carrello: ${product.name} (${quantity}x)`);
                        });
                    }

                    if (buyNowButton) {
                        buyNowButton.addEventListener("click", () => {
                            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
                            console.log(`Acquisto diretto: ${product.name}, Quantità: ${quantity}`);
                            alert(`Acquisto di: ${product.name} (${quantity}x)`);
                        });
                    }
                }
            })
            .catch(error => {
                console.error("Errore nel caricamento dei dettagli del prodotto:", error);
                document.body.innerHTML = `<h1>Errore nel caricamento del prodotto: ${error.message}</h1>`;
            });
    } else {
        document.body.innerHTML = "<h1>Nessun prodotto selezionato</h1>";
    }

    if (overlay) {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                overlay.classList.remove("active");
                document.body.style.overflow = "auto";
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && overlay.classList.contains("active")) {
                overlay.classList.remove("active");
                document.body.style.overflow = "auto";
            }
        });
    }
});