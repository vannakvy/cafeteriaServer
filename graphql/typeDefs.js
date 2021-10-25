import category from "./typeDefs/category.js";
import customer from "./typeDefs/customer.js";
import deliver from "./typeDefs/deliver.js";
import global from "./typeDefs/global.js";
import product from "./typeDefs/product.js";
import purchaseOrder from "./typeDefs/purchaseOrder.js";
import supplier from "./typeDefs/supplier.js";
import telegram from './typeDefs/telegram.js'

const typeDefs = [
    global,
    category,
    product,
    customer,
    deliver,
    supplier,
    purchaseOrder,
    telegram
]

export default typeDefs