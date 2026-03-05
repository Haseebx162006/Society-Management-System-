import express from 'express';
import { protect } from '../middleware/authmiddleware';
import { 
    createSponsor, 
    updateSponsor, 
    deleteSponsor, 
    getSponsorsBySocietyId 
} from '../controllers/sponsorController';

const router = express.Router();

router.use(protect);

router.post('/', createSponsor);
router.get('/society/:society_id', getSponsorsBySocietyId);
router.put('/:id', updateSponsor);
router.delete('/:id', deleteSponsor);

export default router;
