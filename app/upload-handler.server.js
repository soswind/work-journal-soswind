
export async function uploadImage(imageFile) {
    const imageData = await imageFile.arrayBuffer();
    const buffer = Buffer.from(imageData);

    const url = `https://firebasestorage.googleapis.com/v0/b/${process.env.FIREBASE_PROJECT_ID}.appspot.com/o/${imageFile.name}`;
    const response = await fetch(url, {
        method: "POST",
        body: buffer,
        headers: {
            "Content-Type": imageFile.type },
    });

    const data = await response.json();

    if (!data) {
        throw new Error("Image upload failed");
    }

    const imageURL = `${url}?alt=media`;

    return imageURL;
}