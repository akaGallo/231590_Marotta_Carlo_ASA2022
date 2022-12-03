;; domain file: domain-VacuumCleanerAgent.pddl
(define (domain VacuumCleanerAgent)
    (:requirements :strips)
    (:predicates
        (inRoom ?from)
        (door ?from ?to)
        (highCharge )
        (cleaned ?r)
        (mediumCharge )
        (lowCharge )
        (base ?r)              
    )
    
    (:action Move
        :parameters (?from ?to)
        :precondition (and
            	(inRoom ?from)
            	(door ?from ?to))
        :effect (and
            	(not (inRoom ?from))
            	(inRoom ?to))
    )
        
    (:action FirstChargeClean
        :parameters (?r)
        :precondition (and
            	(inRoom ?r)
            	(highCharge ))
        :effect (and
            	(cleaned ?r)
            	(mediumCharge )
            	(not (highCharge )))
    )
        
    (:action SecondChargeClean
        :parameters (?r)
        :precondition (and
            	(inRoom ?r)
            	(mediumCharge ))
        :effect (and
            	(cleaned ?r)
            	(lowCharge )
            	(not (mediumCharge )))
    )
        
    (:action Charge
        :parameters (?r)
        :precondition (and
            	(inRoom ?r)
            	(base ?r)
            	(lowCharge ))
        :effect (and
            	(highCharge )
            	(not (lowCharge ))
            	(not (mediumCharge )))
    )
)