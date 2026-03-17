// ENUM – fixed values
enum CustomerType {
  Regular,
  VIP
}

// INTERFACE – customer structure
interface Customer {
  id: number;
  name: string;
  email: string;
  type: CustomerType;
}

// DECORATOR – logging decorator
function LogMethod(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(`Method ${propertyKey} called`);
    return originalMethod.apply(this, args);
  };

  return descriptor;
}

// CLASS – implements interface
class CustomerService {
  // ARRAY to store customers
  private customers: Customer[] = [];

  // TUPLE – customer basic info
  private customerInfo: [number, string];

  constructor(id: number, name: string) {
    this.customerInfo = [id, name];
  }

  // METHOD with DECORATOR
  // @LogMethod
  registerCustomer(customer: Customer): void {
    this.customers.push(customer);
    console.log("Customer registered:", customer.name);
  }

  // ITERATOR – loop customers
  displayCustomers(): void {
    for (let customer of this.customers) {
      console.log(
        `ID: ${customer.id}, Name: ${customer.name}, Type: ${CustomerType[customer.type]}`
      );
    }
  }
}

// OBJECT creation
const service = new CustomerService(1, "Spider-Man");

// CUSTOMER object
const customer1: Customer = {
  id: 1,
  name: "Spider-Man",
  email: "spider@gmail.com",
  type: CustomerType.VIP
};

// METHOD calls
service.registerCustomer(customer1);
service.displayCustomers();
