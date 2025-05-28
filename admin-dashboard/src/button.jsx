import style from './style.module.css'

const Button = (props) => {


  return (
    <div>

      <button onClick={ () => props.handleDelete(props.id)}><img className={style.svg}
      src="https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-delete-30.png"/></button>

    </div>
  )
}

export default Button;