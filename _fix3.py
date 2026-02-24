fp = "no-somos-ignorantes/css/styles.css"
with open(fp, "r", encoding="utf-8") as f:
    c = f.read()

cursor_css = """
/* Custom Cursor */
body {
    cursor: url('assets/favicon.png'), auto;
}
a, button, [onclick], .product-card, input, textarea, select, label {
    cursor: url('assets/favicon.png'), pointer;
}
"""

c = cursor_css + c
with open(fp, "w", encoding="utf-8") as f:
    f.write(c)
print("OK - cursor personalizado agregado")
