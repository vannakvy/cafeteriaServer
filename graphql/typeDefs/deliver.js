import { gql } from 'apollo-server'

const deliver = gql`

    type Deliver {
        id: String!
        lname: String!
        fname: String!
        tel: String
        email: String
        image: String
        address: String
        geolocation: Geolocation
        uid: String
        token: String
        createAt: String
        updateAt: String
    }

    type DeliverResponse {
        data: [Deliver]
        message: String!
    }

    input DeliverInputSet {
        lname: String!
        fname: String!
        tel: String
        email: String
        image: String
        address: String
        geolocation: InputGeolocation
        uid: String
        token: String
    }

    input DeliverInputUpdate {
        id: String!
        lname: String
        fname: String
        tel: String
        email: String
        image: String
        address: String
        geolocation: InputGeolocation
        uid: String
        token: String
    }
    
    input DeliverInputDelete {
        id: String!
    }

    type Query {
        getDelivers: DeliverResponse
        getDeliversRangeDate(input: InputRangeDate): DeliverResponse
    }

    type Mutation {
        setDelivers(input: DeliverInputSet): Deliver
        updateDelivers(input: DeliverInputUpdate): String
        deleteDelivers(input: DeliverInputDelete): String
    }

    type Subscription{
        newDeliver: Deliver!
    }
    
`;

export default deliver