import uvicorn
from fastapi import FastAPI
from routes import image_route

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}

routes = [image_route.router]

for route in routes:
    app.include_router(route)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
