import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from "typeorm";
import { Character } from "./Character";

@Entity()
export class User {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({ type: 'varchar', length: 10, unique: true })
    username!: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    email!: string;

    @Column({ type: 'varchar', length: 128 })
    password!: string;

    @Column({ type: 'integer', default: 0 })
    block_code!: number;

    @CreateDateColumn({ type: 'datetime' })
    created!: Date;

    @OneToMany(() => Character, character => character.user)
    characters!: Character[];
}
