import { Link } from 'react-router-dom'

export function NotFoundPage() {
    return (
        <div>
            <p><Link to="/">← Zpět na seznam</Link></p>
            <h2>404 – Stránka nenalezena</h2>
            <p>Tahle adresa neexistuje.</p> 
        </div>
    )
}