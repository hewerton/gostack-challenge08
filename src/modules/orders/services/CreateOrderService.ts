import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) throw new AppError('Cutomer does`t exists.');

    const foundProducts = await this.productsRepository.findAllById(products);

    if (!foundProducts.length) throw new AppError('Products doesn`t exists.');

    const noAvaliableProducts = foundProducts.filter(fp => {
      const product = products.filter(p => p.id === fp.id)[0];
      return product.quantity > fp.quantity;
    });

    if (noAvaliableProducts.length)
      throw new AppError('Some products are not avaliable.');

    const order_products = foundProducts.map(fp => {
      const product = products.filter(p => p.id === fp.id)[0];
      return {
        product_id: fp.id,
        quantity: product.quantity,
        price: fp.price,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: order_products,
    });

    const newQuantities = products.map(p => {
      const fp = foundProducts.filter(prod => prod.id === p.id)[0];
      return { id: fp.id, quantity: fp.quantity - p.quantity };
    });

    await this.productsRepository.updateQuantity(newQuantities);

    return order;
  }
}

export default CreateOrderService;
