import {body} from 'express-validator'
export const ProductValidator = [
    body('type', 'type does not Empty').not().isEmpty(),
    body('source', 'source does not Empty').not().isEmpty(),
    body('product', 'product does not Empty').not().isEmpty(),
  ]
  