import { RowDataPacket } from "mysql2"

// Interface que representa um produto.
export interface Product extends RowDataPacket {
    id: number;          // ID do produto.
    name: string;        // Nome.
    price: number;       // Preço.
    description: string; // Descrição.
}
