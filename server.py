from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

DATABASE = "prodotti.db"
IMAGE_BASE_PATH = "images"

def get_product_images(product_id):
    """Restituisce la lista delle immagini disponibili per un prodotto"""
    image_dir = os.path.join(IMAGE_BASE_PATH, str(product_id))
    if not os.path.exists(image_dir):
        return []
    
    images = []
    for i in range(1, 4):
        filename = f"{i:02d}.jpg"
        if os.path.exists(os.path.join(image_dir, filename)):
            images.append(filename)
    
    return images

def get_products_from_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            id, 
            name, 
            description, 
            price, 
            available, 
            category, 
            productor, 
            original
        FROM Catalogo
    """)
    products = [
        {
            "id": row[0], 
            "name": row[1], 
            "description": row[2], 
            "price": row[3], 
            "available": row[4],
            "category": row[5],
            "productor": row[6],
            "original": row[7]
        }
        for row in cursor.fetchall()
    ]
    conn.close()
    return products

@app.route("/products")
def get_products():
    products = get_products_from_db()
    return jsonify(products)

@app.route("/images/<int:product_id>/<filename>")
def get_image(product_id, filename):
    return send_from_directory(f"images/{product_id}", filename)

@app.route("/product/<int:product_id>")
def get_product_details(product_id):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            id, 
            name, 
            description, 
            price, 
            available, 
            category, 
            productor, 
            original
        FROM Catalogo
        WHERE id = ?
    """, (product_id,))
    row = cursor.fetchone()
    
    if row:
        product = {
            "id": row[0],
            "name": row[1],
            "description": row[2],
            "price": row[3],
            "available": row[4],
            "category": row[5],
            "productor": row[6],
            "original": row[7],
            "images": get_product_images(product_id)
        }
        conn.close()
        return jsonify(product)
    else:
        conn.close()
        return jsonify({"error": "Product not found."}), 404

if __name__ == "__main__":
    app.run(debug=True)