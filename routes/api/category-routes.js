const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

// router.get('/categories', async (req, res) => {
//   // Product.findAll({
//   //   include: {
//   //     model: Product, 
//   //     attributes: ["id", "product_name", "price", "stock", "category_id"],
//      try {
//       const categories = await Category.findAll();
//       res.json(categories);
//         } catch (error) {
//           console.error('Error fetching categories:', error);
//           res.status(500).json({ error: 'Internal Server Error'});
//         }
//     });

router.get("/", (req, res) => {
  // find all categories
  // be sure to include its associated Products
  Category.findAll({
    include: {
      model: Product,
      attributes: ["id", "product_name", "price", "stock", "category_id"],
    },
  })
    .then((categoryDB) => {
      if (!categoryDB) {
        res.status(404).json({ message: "Categories not found" });
        return;
      }
      res.json(categoryDB);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/:id', (req, res) => {
  console.log('get category by id,id = ', req.params.id)
  Category.findOne({
    where: {
      id: req.params.id

    },
    include: [
      Product
    ],


  }) 
  .then((Category) => {
    res.json(Category)
  }) 
  .catch((err) => {
    res.status(400).json(err);
  })
  
  // find one category by its `id` value
  // be sure to include its associated Products
});

router.post('/', (req, res) => {
  Category.create(req.body)
  .then((Category) => {
    res.status(200).json(Category)
  })
  .catch((err) => {
    res.status(400).json(err);
  })
  // create a new category
});

router.put('/:id', (req, res) => {
  Category.update(req.body, {
    where: {
      id: req.params.id
    }
  })
  .then((Category) => {
    res.status(200).json(Category)
  })
  .catch((err) => {
    res.status(400).json(err);
  })
  // update a category by its `id` value
});

router.delete('/:id', (req, res) => {
  // delete a category by its `id` value
});

module.exports = router;
