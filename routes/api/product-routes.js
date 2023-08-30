const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
// router.get('/', async (req, res) => {
//   Product.findAll({
//     include: {
//       model: productData,
//       attributes: ["id" , "product_name", "price", "stock", "category_id"],
//     },
//   })
//     .then((categoryDB) => {
//       if (!categoryDB) {
//         res.status(404).json({ message: "Categories not found" });
//         return;
//       }
//       res.json(categoryDB);
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json(err);
//     });
// });
router.get('/', async (req, res) => {
  try {
    // Fetch all products from the database
    const products = await Product.findAll();

    // Send the products as a JSON response
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// get one product
// router.get('/:id', (req, res) => {
//   // find a single product by its `id`
//   // be sure to include its associated Category and Tag data
// });
// router.get('/:id', (req, res) => {
  router.get('/:id', async (req, res) => {
    const productId = req.params.id; // Get the product ID from the URL
  
    try {
      // Find the product by ID in the database
      const product = await Product.findByPk(productId);
  
      // Check if the product exists
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      // Send the product as a JSON response
      res.json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  });


// create new product
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        
        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });

            // figure out which ones to remove
          const productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);
                  // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // Extract the product ID from the URL parameters
  const productId = req.params.id;

  // First, delete associated product tags
  ProductTag.destroy({
    where: {
      product_id: productId,
    },
  })
    .then(() => {
      // Once the associated product tags are deleted, you can delete the product itself
      return Product.destroy({
        where: {
          id: productId,
        },
      });
    })
    .then((numDeleted) => {
      if (numDeleted === 1) {
        // The product was successfully deleted
        res.status(200).json({ message: 'Product deleted successfully' });
      } else {
        // No product was found with the given ID
        res.status(404).json({ message: 'Product not found' });
      }
    })
    .catch((err) => {
      // Handle any errors that occur during deletion
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});


module.exports = router;
