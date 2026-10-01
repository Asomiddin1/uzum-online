// Lorem Picsum - API kalitsiz bepul rasm servisi
// https://picsum.photos/

// Mahsulot kategoriyasi bo'yicha seed raqam bazasi
const categorySeedBase = {
    'Elektronika': 1000,
    'Kiyim': 2000,
    'Uy-joy': 3000,
    'Sport': 4000,
};

// Mahsulot ID va nomi bo'yicha unikal seed yaratish
function generateSeed(productId, productName) {
    // Mahsulot nomidan hash yaratish
    let hash = 0;
    for (let i = 0; i < productName.length; i++) {
        hash = ((hash << 5) - hash) + productName.charCodeAt(i);
        hash = hash & hash; // 32-bit integer
    }
    return Math.abs(hash) + productId;
}

// Bitta mahsulot uchun rasm URL yaratish
function getImageForProduct(productName, category, productId) {
    const seed = generateSeed(productId, productName);
    const categoryBase = categorySeedBase[category] || 5000;
    const finalSeed = categoryBase + seed;
    
    // Lorem Picsum URL: 400x400 o'lchamli, kvadrat rasm
    const imageUrl = `https://picsum.photos/seed/${finalSeed}/400/400`;
    
    return {
        url: imageUrl,
        thumb: `https://picsum.photos/seed/${finalSeed}/200/200`,
        small: `https://picsum.photos/seed/${finalSeed}/300/300`,
        photographer: 'Lorem Picsum',
        source: 'picsum.photos'
    };
}

// Barcha mahsulotlar uchun rasmlar yaratish (async emas, darhol ishlaydi!)
function getImagesForProducts(products) {
    const results = [];
    
    for (const product of products) {
        console.log(`Rasm URL yaratilmoqda: ${product.name}`);
        
        const imageData = getImageForProduct(product.name, product.category, product.id);
        
        results.push({
            productId: product.id,
            productName: product.name,
            imageUrl: imageData ? imageData.url : null,
            photographer: imageData ? imageData.photographer : null
        });
    }
    
    return results;
}

module.exports = {
    getImageForProduct,
    getImagesForProducts
};
