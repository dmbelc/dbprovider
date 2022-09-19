const SqlProvider = class {
    constructor(pool){
        this.pool = pool;
    }

    selectRows = async (sql, params) => {
        const result = await this.scalar(sql,params);
        return result.rows;
    }

    insertObj = async (object, tableName, quote, sign, useParamName) => {
        if(object == null || object == undefined)
            throw new Error("Object is undefined");
        
        if(tableName == null || tableName == undefined)
            throw new Error("tableName is undefined.");

        let sql = 'insert into ' + quote + tableName + quote;
        let fields = ' (';
        let values = '(';
        let paramValues = [];
        let i = 1; 
        Object.entries(object).forEach(([key, value]) => {
                fields += quote + key + quote + ',';
                values += useParamName ? sign + i + "," : sign + ",";
                paramValues.push(value);
                i++;
        });
        fields = fields.substring(0,fields.length - 1) + ")";
        values = values.substring(0,values.length - 1) + ")";
        sql += fields + " values " + values;
        //console.log(sql);
        return await this.scalar(sql, paramValues);
    }

    updateObj = async (object, tableName, whereKVs, quote, sign, useParamName) => {
        if(object == null || object == undefined)
            throw new Error("Object is undefined");
        
        if(tableName == null || tableName == undefined)
            throw new Error("tableName is undefined.");
        if(whereKVs == null || whereKVs == undefined || whereKVs.length < 1)
            throw new Error("whereKVs are underfined");
        
        let sql = "update " + quote + tableName + quote +" set ";
        let paramValues = [];
        let i = 1;
        Object.entries(object).forEach(([key, value]) => {
            sql += quote + key + quote + "=" + sign;
            sql += useParamName ? i + "," : ",";
            paramValues.push(value);
            i++;
        });
        sql = sql.substring(0,sql.length - 1) + ' where';

        Object.entries(whereKVs).forEach(([key, value]) => {
            sql += " " + quote + key + quote +"=" + sign;
            sql += useParamName ? + i + " and" : " and";
            paramValues.push(value);
            i++;
        });
        sql = sql.substring(0,sql.length - 3);
        //console.log(sql);
        await this.scalar(sql, paramValues);
    }

    makeParam = (sign, paramName) => {
        return sign + paramName;
    }
}

module.exports.SqlProvider = SqlProvider;