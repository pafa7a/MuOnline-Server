import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Character {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({ type: 'integer' })
    userId!: number;

    @Column({ type: 'varchar', length: 10 })
    name!: string;

    @ManyToOne(() => User, user => user.characters, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "userId" })
    user!: User;
}
