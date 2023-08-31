const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');




router.get("/", (req, res) => {
  // find all tags and include their associated Products
  Tag.findAll({
    include: {
      model: Product, // Include the Product model
      attributes: ["id", "product_name"]
    },
  })
    .then((tagDB) => {
      if (!tagDB) {
        res.status(404).json({ message: "Tag not found" });
        return;
      }
      res.json(tagDB);
      console.log(tagDB);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});


router.get('/:id', (req, res) => {
  console.log('get category by id,id = ', req.params.id)
  Tag.findOne({
    where: {
      id: req.params.id

    },
    include: [
      Product
    ],


  }) 
  .then((Tag) => {
    res.json(Tag)
  }) 
  .catch((err) => {
    res.status(400).json(err);
  })
  
  // find one category by its `id` value
  // be sure to include its associated Products
});

router.post('/', (req, res) => {
  // create a new tag
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
});

module.exports = router;
