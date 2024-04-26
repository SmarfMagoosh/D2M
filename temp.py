import os
from PIL import Image

def create_thumbnail(image_path, thumbnail_path):
    with Image.open(image_path) as img:
        width, height = img.size
        ratio = 400 / width
        img.thumbnail((width * ratio, height * ratio))
        img.save(thumbnail_path)

for file in os.listdir("./static/meme-templates"):
    create_thumbnail(f"./static/meme-templates/{file}", f"./static/template-thumbnails/{file}")
    print(f"/static/meme-templates/{file}")