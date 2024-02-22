from PIL import Image

# takes in an Image object and returns the thumbnail version
# https://pillow.readthedocs.io/en/stable/reference/Image.html
def create_thumbnail(image):
    img = image.copy()
    img.thumbnail((100, 400))
    return img

image = Image.open("static/images/locked.png")
image.show()
create_thumbnail(image).show()