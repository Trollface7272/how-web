import { Avatar } from "antd"
import Link from "next/link"


export const SearchSelectUserRow = ({ username, id, link }: { username: string, id: string, link: string }) => {
    return (
        <Link href={link}>
            <Avatar src={`https://a.ppy.sh/${id}`} /> {username}
        </Link>
    )
}