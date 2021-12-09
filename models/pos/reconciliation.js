import pkg from 'mongoose';
const { model, Schema } = pkg;

const reconciliationSchema = new Schema({
    code: String,
    products: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: "Products"
            },
            openning: {
                qty: {
                    type: Number,
                    default: 0
                },
                price: {
                    type: Number,
                    default: 0
                },
                total: {
                    type: Number,
                    defualt: 0
                }
            },
            stockIn: {
                qty: {
                    type: Number,
                    default: 0
                },
                price: {
                    type: Number,
                    default: 0
                },
                total: {
                    type: Number,
                    defualt: 0
                }
            },
            stockOut: {
                qty: {
                    type: Number,
                    default: 0
                },
                price: {
                    type: Number,
                    default: 0
                },
                total: {
                    type: Number,
                    defualt: 0
                }
            },
            physical: {
                qty: {
                    type: Number,
                    default: 0
                },
                price: {
                    type: Number,
                    default: 0
                },
                total: {
                    type: Number,
                    defualt: 0
                }
            },
            variance: {
                qty: {
                    type: Number,
                    default: 0
                },
                price: {
                    type: Number,
                    default: 0
                },
                total: {
                    type: Number,
                    defualt: 0
                }
            },
            closing: {
                qty: {
                    type: Number,
                    default: 0
                },
                price: {
                    type: Number,
                    default: 0
                },
                total: {
                    type: Number,
                    defualt: 0
                }
            },
        }
    ],
    accounting: {
        openning: {
            paid: {
                type: Number,
                default: 0
            },
            nonPaid: {
                type: Number,
                default: 0
            }
        },
        income: {
            paid: {
                type: Number,
                default: 0
            },
            nonPaid: {
                type: Number,
                default: 0
            }
        },
        expense: {
            paid: {
                type: Number,
                default: 0
            },
            nonPaid: {
                type: Number,
                default: 0
            }
        },
        closing: {
            paid: {
                type: Number,
                default: 0
            },
            nonPaid: {
                type: Number,
                default: 0
            }
        }
    },
    date: Date,
    remark: String,
    createAt: Date,
})

const Reconciliation = model('Reconciliation', reconciliationSchema)

export default Reconciliation