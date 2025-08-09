import style from './module/style.module.css'
const Button = (props) => {


  return (
    <div>

      <button className={style.buttonModify} onClick={ () => props.handleDelete(props.id)}>Delete</button>

    </div>
  )
}

export default Button;