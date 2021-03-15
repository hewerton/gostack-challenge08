import { getRepository, Repository } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({ name, price, quantity });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = this.ormRepository.findOne({
      where: { name },
    });

    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const foundProducts = await this.ormRepository.findByIds(
      products.map(p => p.id),
    );

    return foundProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const updatedProducts = Promise.all(
      products.map(async p => {
        const product = await this.ormRepository.findOneOrFail(p.id);
        product.quantity = p.quantity;
        await this.ormRepository.save(product);
        return product;
      }),
    );
    return updatedProducts;
  }
}

export default ProductsRepository;
