import category from "./typeDefs/category.js";
import content from "./typeDefs/content.js";
import customer from "./typeDefs/customer.js";
import deliver from "./typeDefs/deliver.js";
import global from "./typeDefs/global.js";
import product from "./typeDefs/product.js";
import purchaseOrder from "./typeDefs/purchaseOrder.js";
import reconciliation from "./typeDefs/reconciliation.js";
import saleOrder from "./typeDefs/saleOrder.js";
import supplier from "./typeDefs/supplier.js";
import telegram from './typeDefs/telegram.js'
import user from "./typeDefs/user.js";

const typeDefs = [
    global,
    category,
    product,
    customer,
    deliver,
    supplier,
    purchaseOrder,
    saleOrder,
    reconciliation,
    user,
    content, 
    telegram
]

export default typeDefs