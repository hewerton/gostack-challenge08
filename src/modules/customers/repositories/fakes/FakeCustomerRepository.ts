import ICreateCustomerDTO from '@modules/customers/dtos/ICreateCustomerDTO';
import ICustomersRepository from '../ICustomersRepository';

class FakeCustomerRepository implements ICustomersRepository {
  private customers: Customer;

  public async create({ name, email }: ICreateCustomerDTO) {}
}
