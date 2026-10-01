require('dotenv').config();
const { createApi } = require('unsplash-js');
const fetch = require('node-fetch');

// Unsplash API ni sozlash
// MUHIM: .env faylida UNSPLASH_ACCESS_KEY ni o'rnating!
const unsplash = createApi({
    accessKey: process.env.UNSPLASH_ACCESS_KEY || 'YOUR_ACCESS_KEY_HERE',
    fetch: fetch,
});

// Mahsulot kategoriyasiga mos rasm qidirish
const searchQueries = {
    'Elektronika': ['smartphone', 'laptop', 'headphones', 'camera', 'gaming console'],
    'Kiyim': ['sneakers', 'fashion clothing', 'hoodie', 'jeans', 'sports shoes'],
    'Uy-joy': ['furniture', 'home decor', 'kitchen', 'lamp', 'sofa'],
    'Sport': ['sports equipment', 'fitness', 'running shoes', 'yoga', 'gym']
};

// Mahsulot nomiga mos query topish
function getSearchQuery(productName, category) {
    // Agar mahsulot nomida taniqli brand bor bo'lsa
    const lowerName = productName.toLowerCase();
    
    if (lowerName.includes('iphone') || lowerName.includes('macbook')) {
        return 'apple product';
    }
    if (lowerName.includes('samsung') || lowerName.includes('galaxy')) {
        return 'samsung phone';
    }
    if (lowerName.includes('nike')) {
        return 'nike shoes';
    }
    if (lowerName.includes('adidas')) {
        return 'adidas clothing';
    }
    if (lowerName.includes('sony')) {
        return 'sony headphones';
    }
    if (lowerName.includes('playstation') || lowerName.includes('ps5')) {
        return 'playstation gaming';
    }
    if (lowerName.includes('levi')) {
        return 'levis jeans';
    }
    
    // Aks holda kategoriya bo'yicha random query
    const queries = searchQueries[category] || ['product'];
    return queries[Math.floor(Math.random() * queries.length)];
}

// Rasm URL ni olish
async function getImageForProduct(productName, category) {
    try {
        const query = getSearchQuery(productName, category);
        
        const result = await unsplash.search.getPhotos({
            query: query,
            page: 1,
            perPage: 1,
            orientation: 'squarish',
        });

        if (result.errors) {
            console.error('Unsplash xatosi:', result.errors[0]);
            return null;
        }

        const photo = result.response.results[0];
        if (photo) {
            return {
                url: photo.urls.regular,
                thumb: photo.urls.thumb,
                small: photo.urls.small,
                photographer: photo.user.name,
                photographerUrl: photo.user.links.html,
                downloadLocation: photo.links.download_location
            };
        }

        return null;
    } catch (error) {
        console.error('Rasm olishda xatolik:', error.message);
        return null;
    }
}

// Bir nechta mahsulot uchun rasmlar olish
async function getImagesForProducts(products) {
    const results = [];
    
    for (const product of products) {
        const imageData = await getImageForProduct(product.name, product.category);
        
        results.push({
            productId: product.id,
            productName: product.name,
            imageUrl: imageData ? imageData.small : null,
            imageData: imageData
        });
        
        // Rate limit oldini olish uchun biroz kutish
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
}

module.exports = {
    unsplash,
    getImageForProduct,
    getImagesForProducts
};
