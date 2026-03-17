// ENUM – fixed values
var CustomerType;
(function (CustomerType) {
    CustomerType[CustomerType["Regular"] = 0] = "Regular";
    CustomerType[CustomerType["VIP"] = 1] = "VIP";
})(CustomerType || (CustomerType = {}));
// DECORATOR – logging decorator
function LogMethod(target, propertyKey, descriptor) {
    var originalMethod = descriptor.value;
    descriptor.value = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log("Method ".concat(propertyKey, " called"));
        return originalMethod.apply(this, args);
    };
    return descriptor;
}
// CLASS – implements interface
var CustomerService = /** @class */ (function () {
    function CustomerService(id, name) {
        // ARRAY to store customers
        this.customers = [];
        this.customerInfo = [id, name];
    }
    // METHOD with DECORATOR
    // @LogMethod
    CustomerService.prototype.registerCustomer = function (customer) {
        this.customers.push(customer);
        console.log("Customer registered:", customer.name);
    };
    // ITERATOR – loop customers
    CustomerService.prototype.displayCustomers = function () {
        for (var _i = 0, _a = this.customers; _i < _a.length; _i++) {
            var customer = _a[_i];
            console.log("ID: ".concat(customer.id, ", Name: ").concat(customer.name, ", Type: ").concat(CustomerType[customer.type]));
        }
    };
    return CustomerService;
}());
// OBJECT creation
var service = new CustomerService(1, "Spider-Man");
// CUSTOMER object
var customer1 = {
    id: 1,
    name: "Spider-Man",
    email: "spider@gmail.com",
    type: CustomerType.VIP
};
// METHOD calls
service.registerCustomer(customer1);
service.displayCustomers();
