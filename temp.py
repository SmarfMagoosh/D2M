from PIL import Image
# takes in a Pillow Image object and returns the thumbnail version
def create_thumbnail(image_path, dimensions = (400, 400)):
    img = Image.open(image_path)
    img.thumbnail(dimensions)
    return img
create_thumbnail("static/images/4 rules.png").save("static/images/thumbnails/10.png")
create_thumbnail("static/images/Gimbal_Lock_Plane.gif").save("static/images/thumbnails/20.png")
create_thumbnail("static/images/Stop doing databases.png").save("static/images/thumbnails/30.png")