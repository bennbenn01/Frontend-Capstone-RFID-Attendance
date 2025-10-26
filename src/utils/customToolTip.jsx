import '../styles/customToolTip.css'

export const chartToolTip = ({ active, payload }) => {
    if(active && payload && payload.length) {
        const data = payload[0].payload;

        const paid = data.Paid === 1 ? 'Yes' : '-'
        const not_paid = data['Not Paid'] === 0 ? '-' : 'No'

        return (
            <div className='custom-tooltip-main-container'>
                <p className='driver-text'>
                    <span>Driver:</span> 
                    <span>{data.full_name}</span>
                </p>

                <p className='butaw-text'>
                    <span>Butaw:</span> 
                    <span>{data.butaw}</span>
                </p>

                <p className='boundary-text'>
                    <span>Boundary:</span> 
                    <span>{data.boundary}</span>
                </p>

                <p className='paid-text'>
                    <span>Paid:</span> 
                    <span>{paid}</span>
                </p>

                <p className='not-paid-text'>
                    <span>Not Paid:</span> 
                    <span>{not_paid}</span>
                </p>
            </div>
        )

    }
}