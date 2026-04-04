import os
from werkzeug.utils import secure_filename
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector


# -----------------------
# Flask setup
# -----------------------

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(os.getcwd(), "images")
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# -----------------------
# MySQL connection
# -----------------------
def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Chandan@2007",
        database="farmconnect"
    )

# -----------------------
# category count
# -----------------------

@app.route("/category-count", methods=["GET"])
def category_count():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        SELECT category, COUNT(*) 
        FROM products 
        GROUP BY category
    """)

    result = cursor.fetchall()
    cursor.close()
    db.close()

    data = {}

    for row in result:
        data[row[0].lower()] = row[1]

    return jsonify(data)

# -----------------------
# counsumer, farmer and product count
# -----------------------
@app.route("/stats", methods=["GET"])
def get_stats():
    db = get_db()
    cursor = db.cursor()
    farmer_sql = "SELECT COUNT(*) FROM users WHERE role='farmer'"
    consumer_sql = "SELECT COUNT(*) FROM users WHERE role='consumer'"
    product_sql = "SELECT COUNT(*) FROM products"

    cursor.execute(farmer_sql)
    farmers = cursor.fetchone()[0]

    cursor.execute(consumer_sql)
    consumers = cursor.fetchone()[0]

    cursor.execute(product_sql)
    products = cursor.fetchone()[0]

    cursor.close()
    db.close()

    return jsonify({
        "farmers": farmers,
        "consumers": consumers,
        "products": products
    })

# -----------------------
# Test route
# -----------------------

@app.route("/")
def home():
    return "FarmConnect Backend Running"


# -----------------------
# Register
# -----------------------

@app.route("/register", methods=["POST"])
def register():

    data = request.json
    db = get_db()
    cursor = db.cursor()

    sql = """
    INSERT INTO users(name,email,password,role)
    VALUES(%s,%s,%s,%s)
    """

    values = (
        data["name"],
        data["email"],
        data["password"],
        data["role"]
    )

    
    cursor.execute(sql, values)
    db.commit()

    cursor.close()
    db.close()
    return jsonify({"message": "User registered"})


# -----------------------
# Login
# -----------------------

@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    db = get_db()
    cursor = db.cursor()

    sql = "SELECT name,email,role FROM users WHERE email=%s AND password=%s"

    cursor.execute(sql,(email,password))

    user = cursor.fetchone()

    cursor.close()
    db.close()

    if user:

        return jsonify({
            "message":"Login successful",
            "name":user[0],
            "email":user[1],
            "role":user[2]
        })

    else:

        return jsonify({
            "message":"Invalid email or password"
        }),401


# -----------------------
# Add product
# -----------------------

@app.route("/add-product", methods=["POST"])
def add_product():

    name = request.form.get("name")
    category = request.form.get("category")
    price = request.form.get("price")
    farmer_email = request.form.get("farmer_email")

    image = request.files.get("image")

    if image is None:
        return {"message":"Image not received"},400

    filename = secure_filename(image.filename)

    image.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))

    db = get_db()
    cursor = db.cursor()

    sql = """
    INSERT INTO products(name, category, price, farmer_email, image)
    VALUES(%s,%s,%s,%s,%s)
    """

    cursor.execute(sql,(name,category,price,farmer_email,filename))
    db.commit()
    cursor.close()
    db.close()

    return {"message":"Product added successfully"}

# -----------------------
# Get farmer products
# -----------------------

@app.route("/farmer-products/<email>", methods=["GET"])
def farmer_products(email):
    db = get_db()
    cursor = db.cursor()

    sql = "SELECT * FROM products WHERE farmer_email=%s"

    cursor.execute(sql,(email,))

    result = cursor.fetchall()
    cursor.close()
    db.close()

    products = []

    for row in result:

        products.append({

            "id": row[0],
            "name": row[1],
            "category": row[2],
            "price": float(row[3]),
            "farmer_email": row[4],
            "image": row[5]

        })

    return jsonify(products)

# -----------------------
# Update product
# -----------------------

@app.route("/update-product/<int:id>", methods=["PUT"])
def update_product(id):

    name = request.form.get("name")
    category = request.form.get("category")
    price = request.form.get("price")

    db = get_db()
    cursor = db.cursor()
    sql = """
    UPDATE products
    SET name=%s, category=%s, price=%s
    WHERE id=%s
    """

    cursor.execute(sql,(name,category,price,id))
    db.commit()
    cursor.close()
    db.close()


    return jsonify({
        "message":"Product updated"
    })


# -----------------------
# Delete product
# -----------------------

@app.route("/delete-product/<int:id>", methods=["DELETE"])
def delete_product(id):
    db = get_db()
    cursor = db.cursor()
    sql = "DELETE FROM products WHERE id=%s"

    cursor.execute(sql,(id,))
    db.commit()
    cursor.close()
    db.close()


    return jsonify({
        "message":"Product deleted successfully"
    })


# -----------------------
# Serve images
# -----------------------

@app.route("/images/<filename>")
def get_image(filename):

    return send_from_directory(
        app.config["UPLOAD_FOLDER"],
        filename
    )

# -----------------------
# Place order
# -----------------------

@app.route("/place-order", methods=["POST"])
def place_order():

    data = request.json
    db = get_db()
    cursor = db.cursor()
    sql = """
    INSERT INTO orders(product_id, consumer_email, farmer_email, address)
    VALUES(%s,%s,%s,%s)
    """

    cursor.execute(sql,(
        data["product_id"],
        data["consumer_email"],
        data["farmer_email"],
        data["address"],
    ))

    db.commit()
    cursor.close()
    db.close()


    return {"message":"Order placed successfully"}

# -----------------------
# Farmer orders
# -----------------------
@app.route("/farmer-orders/<email>", methods=["GET"])
def farmer_orders(email):
    db = get_db()
    cursor = db.cursor()
    sql = """
    SELECT orders.id, products.name, orders.consumer_email, orders.status
    FROM orders
    JOIN products ON orders.product_id = products.id
    WHERE orders.farmer_email=%s
    """

    cursor.execute(sql,(email,))
    result = cursor.fetchall()
    cursor.close()
    db.close()

    orders = []

    for row in result:

        orders.append({
            "id":row[0],
            "product":row[1],
            "consumer":row[2],
            "status":row[3]
        })

    return jsonify(orders)


# -----------------------
# Consumer orders
# -----------------------
@app.route("/consumer-orders/<email>", methods=["GET"])
def consumer_orders(email):

    db = get_db()
    cursor = db.cursor()

    sql = """
    SELECT orders.id, products.name, orders.status
    FROM orders
    JOIN products ON orders.product_id = products.id
    WHERE orders.consumer_email=%s
    """

    cursor.execute(sql, (email,))
    orders_data = cursor.fetchall()

    orders = []

    for order in orders_data:
        order_id = order[0]

        # ✅ fetch history
        cursor.execute("""
            SELECT status, updated_at
            FROM order_status_history
            WHERE order_id=%s
            ORDER BY updated_at ASC
        """, (order_id,))

        history_rows = cursor.fetchall()

        history = []
        for h in history_rows:
            history.append({
                "status": h[0],
                "time": h[1]
            })

        orders.append({
            "id": order_id,
            "product": order[1],
            "current_status": order[2],
            "history": history
        })

    cursor.close()
    db.close()

    return jsonify(orders)

# -----------------------
# Update order status
# -----------------------
from datetime import datetime

from datetime import datetime

@app.route("/update-order/<int:id>", methods=["PUT"])
def update_order(id):

    data = request.json
    status = data["status"].strip().lower()
    db = get_db()
    cursor = db.cursor()
    # 🔹 Update main orders table
    sql = """
    UPDATE orders
    SET status=%s,
        updated_at=%s
    WHERE id=%s
    """
    cursor.execute(sql, (status, datetime.now(), id))

    # 🔥 Insert into history table
    history_sql = """
    INSERT INTO order_status_history (order_id, status)
    VALUES (%s, %s)
    """
    cursor.execute(history_sql, (id, status))

    db.commit()

    # return updated values
    cursor.execute("SELECT status, updated_at FROM orders WHERE id=%s", (id,))
    row = cursor.fetchone()
    cursor.close()
    db.close()

    return {
        "status": row[0],
        "updated_at": row[1]
    }
# fetching history
@app.route("/order-history/<int:order_id>", methods=["GET"])
def order_history(order_id):
    db = get_db()
    cursor = db.cursor()
    sql = """
    SELECT status, updated_at
    FROM order_status_history
    WHERE order_id=%s
    ORDER BY updated_at ASC
    """

    cursor.execute(sql, (order_id,))
    rows = cursor.fetchall()
    cursor.close()
    db.close()

    history = []

    for row in rows:
        history.append({
            "status": row[0],
            "time": row[1]
        })

    return history


# -----------------------
# Get products (category + search)
# -----------------------
@app.route("/products", methods=["GET"])
def get_products():

    category = request.args.get("category")
    search = request.args.get("search")
    db = get_db()
    cursor = db.cursor()
    if search:
        cursor.execute(
            "SELECT * FROM products WHERE name LIKE %s",
            ("%" + search + "%",)
        )

    elif category:
        cursor.execute(
            "SELECT * FROM products WHERE category=%s",
            (category,)
        )

    else:
        cursor.execute("SELECT * FROM products")

    result = cursor.fetchall()
    cursor.close()
    db.close()

    products=[]

    for row in result:

        products.append({

            "id":row[0],
            "name":row[1],
            "category":row[2],
            "price":float(row[3]),
            "farmer_email":row[4],
            "image":row[5]

        })

    return jsonify(products)

# -----------------------
# Search suggestions
# -----------------------
@app.route("/search-suggestions", methods=["GET"])
def search_suggestions():

    query = request.args.get("q")

    if not query:
        return jsonify([])
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "SELECT id, name FROM products WHERE name LIKE %s LIMIT 5",
        ("%" + query + "%",)
    )

    result = cursor.fetchall()
    cursor.close()
    db.close()

    suggestions = []

    for row in result:
        suggestions.append({
            "id": row[0],
            "name": row[1]
        })

    return jsonify(suggestions)
# -----------------------
# Run server
# -----------------------
if __name__ == "__main__":
    app.run(debug=True)