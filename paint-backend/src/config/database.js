const mongoose = require('mongoose');

const connectDatabase = async() => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
            

        console.log(`MongoDb Connected: ${conn.connection.host}`);
        console.log(`Database name: ${conn.connection.name}`);
    }catch(error){
        console.error(`MongoDB Connection Failed: ${error.message}`);
        process.exit(1);
    }
}

module.exports = connectDatabase;